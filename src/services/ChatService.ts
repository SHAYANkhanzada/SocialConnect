import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    createdAt: any;
}

export interface ChatRoom {
    id: string;
    participants: string[];
    lastMessage: string;
    lastMessageTime: any;
    otherUser?: {
        uid: string;
        displayName: string;
        photoURL: string | null;
    };
}

export const ChatService = {
    // Get or create a chat room between two users
    getOrCreateChatRoom: async (partnerUid: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not authenticated");

        const roomId = [currentUser.uid, partnerUid].sort().join('_');
        const roomRef = doc(db, 'chatRooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) {
            await setDoc(roomRef, {
                participants: [currentUser.uid, partnerUid],
                lastMessage: '',
                lastMessageTime: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
        }

        return roomId;
    },

    // Send a message
    sendMessage: async (roomId: string, text: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not authenticated");

        const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
        const roomRef = doc(db, 'chatRooms', roomId);

        await Promise.all([
            addDoc(messagesRef, {
                text,
                senderId: currentUser.uid,
                createdAt: serverTimestamp(),
            }),
            setDoc(roomRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp(),
            }, { merge: true })
        ]);
    },

    // Subscribe to messages in a room
    subscribeToMessages: (roomId: string, callback: (messages: ChatMessage[]) => void) => {
        const q = query(
            collection(db, 'chatRooms', roomId, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChatMessage));
            callback(messages);
        });
    },

    // Subscribe to user's chat rooms
    subscribeToChatRooms: (callback: (rooms: ChatRoom[]) => void) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return () => { };

        const q = query(
            collection(db, 'chatRooms'),
            where('participants', 'array-contains', currentUser.uid),
            orderBy('lastMessageTime', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const rooms = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChatRoom));
            callback(rooms);
        });
    }
};

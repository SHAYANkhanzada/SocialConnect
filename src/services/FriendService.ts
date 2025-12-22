import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    deleteDoc,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface FriendRequest {
    id: string;
    fromUid: string;
    toUid: string;
    fromName: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: any;
}

export const FriendService = {
    // Send a friend request
    sendFriendRequest: async (targetUid: string, targetName: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not authenticated");

        const requestId = `${currentUser.uid}_${targetUid}`;
        const requestRef = doc(db, 'friendRequests', requestId);

        await setDoc(requestRef, {
            fromUid: currentUser.uid,
            fromName: currentUser.displayName || 'Anonymous',
            toUid: targetUid,
            toName: targetName,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
    },

    // Respond to a friend request
    respondToRequest: async (requestId: string, status: 'accepted' | 'rejected') => {
        const requestRef = doc(db, 'friendRequests', requestId);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) throw new Error("Request not found");
        const requestData = requestSnap.data() as FriendRequest;

        if (status === 'accepted') {
            // Create friendship records
            const friendshipId1 = `${requestData.fromUid}_${requestData.toUid}`;
            const friendshipId2 = `${requestData.toUid}_${requestData.fromUid}`;

            await Promise.all([
                setDoc(doc(db, 'friends', friendshipId1), {
                    uid: requestData.fromUid,
                    friendUid: requestData.toUid,
                    createdAt: serverTimestamp(),
                }),
                setDoc(doc(db, 'friends', friendshipId2), {
                    uid: requestData.toUid,
                    friendUid: requestData.fromUid,
                    createdAt: serverTimestamp(),
                }),
                deleteDoc(requestRef) // Remove the request
            ]);
        } else {
            // Just delete the request if rejected
            await deleteDoc(requestRef);
        }
    },

    // Get current pending requests for the user
    subscribeToPendingRequests: (callback: (requests: FriendRequest[]) => void) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return () => { };

        const q = query(
            collection(db, 'friendRequests'),
            where('toUid', '==', currentUser.uid),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FriendRequest));
            callback(requests);
        });
    },

    // Get friends list
    getFriends: async (): Promise<string[]> => {
        const currentUser = auth.currentUser;
        if (!currentUser) return [];

        const q = query(collection(db, 'friends'), where('uid', '==', currentUser.uid));
        const snap = await getDocs(q);
        return snap.docs.map(doc => doc.data().friendUid);
    },

    // Check relationship status
    getRelationshipStatus: async (targetUid: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return 'none';

        // Check if already friends
        const friendshipId = `${currentUser.uid}_${targetUid}`;
        const friendSnap = await getDoc(doc(db, 'friends', friendshipId));
        if (friendSnap.exists()) return 'friends';

        // Check if there is a pending request
        const requestId1 = `${currentUser.uid}_${targetUid}`;
        const requestSnap1 = await getDoc(doc(db, 'friendRequests', requestId1));
        if (requestSnap1.exists()) return 'sent';

        const requestId2 = `${targetUid}_${currentUser.uid}`;
        const requestSnap2 = await getDoc(doc(db, 'friendRequests', requestId2));
        if (requestSnap2.exists()) return 'received';

        return 'none';
    }
};

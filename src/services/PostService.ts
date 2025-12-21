import {
    collection,
    addDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    increment,
    onSnapshot,
    Unsubscribe,
    deleteDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    text: string;
    imageUrl: string | null;
    likes: number;
    likedBy: string[];
    createdAt: any;
}

export const PostService = {
    // Create a new post
    createPost: async (text: string, imageUrl: string | null) => {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        await addDoc(collection(db, 'posts'), {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userAvatar: user.photoURL,
            text,
            imageUrl,
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp(),
        });
    },

    // Subscribe to posts (Real-time)
    subscribeToPosts: (callback: (posts: Post[]) => void): Unsubscribe => {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Post));
            callback(posts);
        });
    },

    // Toggle Like
    toggleLike: async (postId: string, isLiked: boolean) => {
        const user = auth.currentUser;
        if (!user) return;

        const postRef = doc(db, 'posts', postId);

        if (isLiked) {
            // Unlike
            await updateDoc(postRef, {
                likes: increment(-1),
                likedBy: arrayRemove(user.uid)
            });
        } else {
            // Like
            await updateDoc(postRef, {
                likes: increment(1),
                likedBy: arrayUnion(user.uid)
            });
        }
    },

    // Add a comment
    addComment: async (postId: string, text: string) => {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        await addDoc(collection(db, 'posts', postId, 'comments'), {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userAvatar: user.photoURL,
            text,
            createdAt: serverTimestamp(),
        });
    },

    // Subscribe to comments (Real-time)
    subscribeToComments: (postId: string, callback: (comments: Comment[]) => void): Unsubscribe => {
        const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Comment));
            callback(comments);
        });
    },
    // Delete a post
    deletePost: async (postId: string) => {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const postRef = doc(db, 'posts', postId);
        await deleteDoc(postRef);
    }
};

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    text: string;
    createdAt: any;
}

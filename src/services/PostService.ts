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
    deleteDoc,
    where,
    limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { UserService } from './UserService';

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

        // Fetch latest user profile from Firestore to get the Base64 photoURL
        const userProfile = await UserService.getUserProfile(user.uid);
        const displayName = userProfile?.displayName || user.displayName || 'Anonymous';
        const photoURL = userProfile?.photoURL || user.photoURL;

        try {
            await addDoc(collection(db, 'posts'), {
                userId: user.uid,
                userName: displayName,
                userAvatar: photoURL,
                text,
                textLower: text.toLowerCase(),
                imageUrl,
                likes: 0,
                likedBy: [],
                createdAt: serverTimestamp(),
            });
        } catch (error: any) {
            console.error("Firestore createPost Error:", error);
            if (error.code === 'permission-denied') {
                throw new Error("Permission Denied: Please check your Firebase Security Rules in the console.");
            } else if (error.message && error.message.includes('too large')) {
                throw new Error("Image too large: Please try a smaller image or reduce quality.");
            }
            throw error;
        }
    },

    // "Upload" image (now just returns base64 for Firestore storage to bypass Storage limits)
    uploadImage: async (base64: string): Promise<string> => {
        // We just return it as a data URL so it can be stored in Firestore
        // and displayed easily in the app.
        return `data:image/jpeg;base64,${base64}`;
    },

    // Subscribe to posts (Real-time)
    subscribeToPosts: (callback: (posts: Post[]) => void): Unsubscribe => {
        console.log("Subscribing to posts...");
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            console.log(`Received ${snapshot.size} posts from Firestore`);
            const posts = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // If createdAt is null (pending server timestamp), use current date as fallback
                    createdAt: data.createdAt || { seconds: Date.now() / 1000 }
                } as Post;
            });
            callback(posts);
        }, (error) => {
            console.error("Firestore subscription error (Global):", error);
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
        }, (error) => {
            console.error("Firestore subscription error (Comments):", error);
        });
    },

    // Update a post
    updatePost: async (postId: string, text: string) => {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            text,
            textLower: text.toLowerCase(),
            updatedAt: serverTimestamp(),
        });
    },
    // Delete a post
    deletePost: async (postId: string) => {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const postRef = doc(db, 'posts', postId);
        await deleteDoc(postRef);
    },

    // Get post count for a user
    getUserPostCount: async (userId: string): Promise<number> => {
        const q = query(collection(db, 'posts'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.size;
    },

    // Subscribe to a specific user's posts
    subscribeToUserPosts: (userId: string, callback: (posts: Post[]) => void): Unsubscribe => {
        const q = query(
            collection(db, 'posts'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt || { seconds: Date.now() / 1000 }
                } as Post;
            });
            callback(posts);
        }, (error) => {
            console.error("Firestore subscription error (UserPosts):", error);
        });
    },

    // Subscribe to following posts
    subscribeToFollowingPosts: (userId: string, callback: (posts: Post[]) => void): Unsubscribe => {
        const followingQuery = query(collection(db, 'follows'), where('followerId', '==', userId));
        let unsubscribePosts: Unsubscribe | null = null;

        const unsubscribeFollowing = onSnapshot(followingQuery, (followingSnapshot) => {
            // Unsubscribe existing post listener if it exists
            if (unsubscribePosts) {
                unsubscribePosts();
            }

            // Start with current user's ID
            const followingIds = [userId];

            // Add users that are being followed
            followingSnapshot.docs.forEach(doc => {
                const followingId = doc.data().followingId;
                if (followingId && !followingIds.includes(followingId)) {
                    followingIds.push(followingId);
                }
            });

            // Limit to 10 (Safest Firestore limit for 'in' query)
            const limitedIds = followingIds.slice(0, 10);

            const q = query(
                collection(db, 'posts'),
                where('userId', 'in', limitedIds),
                orderBy('createdAt', 'desc')
            );

            unsubscribePosts = onSnapshot(q, (snapshot) => {
                const posts = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt || { seconds: Date.now() / 1000 }
                    } as Post;
                });
                callback(posts);
            }, (error) => {
                console.error("Firestore subscription error (Following):", error);
            });
        }, (error) => {
            console.error("Firestore subscription error (FollowList):", error);
        });

        // Return a combined unsubscribe function
        return () => {
            unsubscribeFollowing();
            if (unsubscribePosts) {
                unsubscribePosts();
            }
        };
    },

    // Subscribe to all posts (Global Feed)
    subscribeToAllPosts: (callback: (posts: Post[]) => void): Unsubscribe => {
        console.log("Subscribing to all posts...");
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
        return onSnapshot(q, (snapshot) => {
            console.log(`Firestore Snapshot: ${snapshot.size} posts found`);
            const posts = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt || { seconds: Date.now() / 1000 }
                } as Post;
            });
            callback(posts);
        }, (error) => {
            console.error("Firestore Global Feed Subscription Error:", error);
            // Optionally stop loading state in UI by calling callback with empty array or handling error
            callback([]);
        });
    },

    // Search posts by text
    searchPosts: async (searchTerm: string): Promise<Post[]> => {
        const trimmedTerm = searchTerm.trim().toLowerCase();
        if (!trimmedTerm) return [];

        const q = query(
            collection(db, 'posts'),
            where('textLower', '>=', trimmedTerm),
            where('textLower', '<=', trimmedTerm + '\uf8ff'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Post));
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

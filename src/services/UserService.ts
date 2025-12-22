import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    deleteDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface UserProfile {
    uid: string;
    displayName: string;
    displayNameLower: string; // For case-insensitive search
    email: string;
    photoURL: string | null;
    createdAt: any;
}

export const UserService = {
    // Save or update user profile in Firestore
    upsertUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        const userRef = doc(db, 'users', uid);
        const updateData: any = { ...data, updatedAt: new Date() };

        if (data.displayName) {
            updateData.displayNameLower = data.displayName.toLowerCase();
        }

        await setDoc(userRef, updateData, { merge: true });
    },

    // Get a single user profile
    getUserProfile: async (uid: string): Promise<UserProfile | null> => {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    },

    // Search users by display name (case-insensitive prefix search)
    searchUsers: async (searchTerm: string): Promise<UserProfile[]> => {
        const trimmedTerm = searchTerm.trim();
        if (!trimmedTerm) return [];

        const lowerSearchTerm = trimmedTerm.toLowerCase();
        const currentUserId = auth.currentUser?.uid;
        console.log(`Searching for: "${trimmedTerm}" | Current User: ${currentUserId}`);

        // Primary search using lowercase field
        const qLower = query(
            collection(db, 'users'),
            where('displayNameLower', '>=', lowerSearchTerm),
            where('displayNameLower', '<=', lowerSearchTerm + '\uf8ff'),
            limit(20)
        );

        let querySnapshot = await getDocs(qLower);
        console.log(`Found ${querySnapshot.size} results with displayNameLower`);

        // Fallback: If no results, try case-sensitive search for older accounts
        if (querySnapshot.empty) {
            console.log("No results with lowercase, trying case-sensitive fallback...");
            const qNormal = query(
                collection(db, 'users'),
                where('displayName', '>=', trimmedTerm),
                where('displayName', '<=', trimmedTerm + '\uf8ff'),
                limit(20)
            );
            querySnapshot = await getDocs(qNormal);
            console.log(`Found ${querySnapshot.size} results with case-sensitive fallback`);
        }

        const results = querySnapshot.docs
            .map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        // .filter(user => user.uid !== auth.currentUser?.uid); // Temporarily commented out for testing

        console.log(`Final results count (after filtering self): ${results.length}`);
        return results;
    },

    // Toggle Follow/Unfollow
    toggleFollow: async (targetUserId: string, isFollowing: boolean) => {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) throw new Error("User not authenticated");

        const followId = `${currentUserId}_${targetUserId}`;
        const followRef = doc(db, 'follows', followId);

        if (isFollowing) {
            // Unfollow
            await deleteDoc(followRef);
        } else {
            // Follow
            await setDoc(followRef, {
                followerId: currentUserId,
                followingId: targetUserId,
                createdAt: new Date(),
            });
        }
    },

    // Check if current user is following target user
    checkIfFollowing: async (targetUserId: string): Promise<boolean> => {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) return false;

        const followId = `${currentUserId}_${targetUserId}`;
        const followRef = doc(db, 'follows', followId);
        const followSnap = await getDoc(followRef);
        return followSnap.exists();
    },

    // Get follow stats (followers and following counts)
    getFollowStats: async (userId: string) => {
        const followersQuery = query(collection(db, 'follows'), where('followingId', '==', userId));
        const followingQuery = query(collection(db, 'follows'), where('followerId', '==', userId));

        const [followersSnap, followingSnap] = await Promise.all([
            getDocs(followersQuery),
            getDocs(followingQuery),
        ]);

        return {
            followers: followersSnap.size,
            following: followingSnap.size,
        };
    }
};

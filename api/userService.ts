import { MOCK_USERS, simulateDelay, JWT_KEY, getAndSaveUser } from './mockData';
import type { User, ChatSettings, QAPair } from '../types';
import { getCurrentUser } from './authService';

const calculateFollowersCount = (userId: string): number => {
    let count = 0;
    MOCK_USERS.forEach(u => {
        if (u.followingIds?.includes(userId)) {
            count++;
        }
    });
    return count;
};


/**
 * Fetches a user's public profile information by their ID.
 * @param userId The ID of the user to fetch.
 * @returns A promise that resolves to the User object or null if not found.
 */
export const getUserById = async (userId: string): Promise<User | null> => {
    await simulateDelay(200);
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return null;

    return {
        ...user,
        followersCount: calculateFollowersCount(userId),
    };
};

/**
 * Updates the current user's profile.
 * @param updates A partial user object with the fields to update.
 * @returns The fully updated user object.
 */
export const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
    await simulateDelay(500);
    const currentUser = await getCurrentUser(); // Fetch with follower count
    if (!currentUser) throw new Error("Authentication required.");
    const updatedUser = { ...currentUser, ...updates };
    
    // This mock doesn't persist the follower count, it's always dynamic.
    // Just update other fields.
    const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updates };
    }
    localStorage.setItem(JWT_KEY, JSON.stringify(updatedUser));
    return updatedUser;
};


/**
 * Follows another user.
 * @param userIdToFollow The ID of the user to follow.
 * @returns A promise that resolves to the updated current user object.
 */
export const followUser = async (userIdToFollow: string): Promise<User> => {
    await simulateDelay(300);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required to follow users.");
    if (currentUser.id === userIdToFollow) throw new Error("You cannot follow yourself.");

    const followingIds = currentUser.followingIds || [];
    if (!followingIds.includes(userIdToFollow)) {
        followingIds.push(userIdToFollow);
    }
    const updatedUser = { ...currentUser, followingIds };

    // In this mock, we have to update the user object in both the MOCK_USERS array
    // and the JWT in localStorage to ensure consistency across the app.
    const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
    }
    localStorage.setItem(JWT_KEY, JSON.stringify(updatedUser));
    
    return updatedUser;
};

/**
 * Unfollows another user.
 * @param userIdToUnfollow The ID of the user to unfollow.
 * @returns A promise that resolves to the updated current user object.
 */
export const unfollowUser = async (userIdToUnfollow: string): Promise<User> => {
    await simulateDelay(300);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const followingIds = (currentUser.followingIds || []).filter(id => id !== userIdToUnfollow);
    const updatedUser = { ...currentUser, followingIds };
    
    const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
    }
    localStorage.setItem(JWT_KEY, JSON.stringify(updatedUser));

    return updatedUser;
};

/**
 * Updates the chat settings for the current user.
 * @param settings The new chat settings.
 * @returns The updated user object.
 */
export const updateChatSettings = async (settings: ChatSettings): Promise<User> => {
    await simulateDelay(400);
    return getAndSaveUser(user => ({
        ...user,
        chatSettings: {
            ...user.chatSettings,
            ...settings
        }
    }));
};

/**
 * Adds a new learned question-answer pair to the user's AI knowledge base.
 * @param qaPair The question and answer pair to learn.
 * @returns The updated user object.
 */
export const addLearnedQA = async (qaPair: QAPair): Promise<User> => {
    await simulateDelay(200);
    return getAndSaveUser(user => {
        const learnedQA = user.learnedQA || [];
        // Prevent duplicates
        const exists = learnedQA.some(
            p => p.question.toLowerCase() === qaPair.question.toLowerCase() && p.adId === qaPair.adId
        );
        if (!exists) {
            learnedQA.push(qaPair);
        }
        return { ...user, learnedQA };
    });
};

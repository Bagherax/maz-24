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
    return getAndSaveUser(user => ({...user, ...updates}));
};


/**
 * Follows another user.
 * @param userIdToFollow The ID of the user to follow.
 * @returns A promise that resolves to the updated current user object.
 */
export const followUser = async (userIdToFollow: string): Promise<User> => {
    await simulateDelay(300);
    
    return getAndSaveUser(user => {
        if (user.id === userIdToFollow) throw new Error("You cannot follow yourself.");
        const followingIds = user.followingIds || [];
        if (!followingIds.includes(userIdToFollow)) {
            followingIds.push(userIdToFollow);
        }
        return { ...user, followingIds };
    });
};

/**
 * Unfollows another user.
 * @param userIdToUnfollow The ID of the user to unfollow.
 * @returns A promise that resolves to the updated current user object.
 */
export const unfollowUser = async (userIdToUnfollow: string): Promise<User> => {
    await simulateDelay(300);
    return getAndSaveUser(user => {
        const followingIds = (user.followingIds || []).filter(id => id !== userIdToUnfollow);
        return { ...user, followingIds };
    });
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
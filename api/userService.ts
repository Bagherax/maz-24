import { MOCK_USERS, simulateDelay, JWT_KEY, getAndSaveUser } from './mockData';
import type { User } from '../types';
import { getCurrentUser } from './authService';

/**
 * Fetches a user's public profile information by their ID.
 * @param userId The ID of the user to fetch.
 * @returns A promise that resolves to the User object or null if not found.
 */
export const getUserById = async (userId: string): Promise<User | null> => {
    await simulateDelay(200);
    const user = MOCK_USERS.find(u => u.id === userId);
    return user || null;
};

/**
 * Updates the current user's profile.
 * @param updates A partial user object with the fields to update.
 * @returns The fully updated user object.
 */
export const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
    await simulateDelay(500);
    return getAndSaveUser(user => ({ ...user, ...updates }));
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
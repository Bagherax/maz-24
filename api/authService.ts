import type { User } from '../types';
import { MOCK_USERS, JWT_KEY, simulateDelay, saveUsersToDb } from './mockData';

// --- AUTH LISTENER ---
let authListeners: ((user: User | null) => void)[] = [];

const notifyAuthChange = (user: User | null) => {
    authListeners.forEach(listener => listener(user));
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
    authListeners.push(callback);
    // Immediately call with current state
    getCurrentUser().then(user => callback(user));
    return () => {
        authListeners = authListeners.filter(listener => listener !== callback);
    };
};

const calculateFollowersCount = (userId: string): number => {
    let count = 0;
    MOCK_USERS.forEach(u => {
        if (u.followingIds?.includes(userId)) {
            count++;
        }
    });
    return count;
};

// --- API FUNCTIONS ---

export const login = async (email: string, password_unused: string): Promise<User> => {
    await simulateDelay(500);
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
        localStorage.setItem(JWT_KEY, JSON.stringify(user));
        notifyAuthChange(user);
        return user;
    }
    throw new Error('Invalid credentials');
};

export const register = async (username: string, email: string, password_unused: string, invitationCode?: string): Promise<User> => {
    await simulateDelay(500);
    if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Email already in use');
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        tier: 'normal',
        isVerified: false,
        avatarUrl: `https://picsum.photos/seed/${username}/200`,
        boostPoints: 0,
    };

    if (invitationCode) {
        const normalizedCode = invitationCode.trim().toUpperCase();
        const referrer = MOCK_USERS.find(u => {
            const userCode = `${u.username.toUpperCase().slice(0, 5)}${u.id.slice(-4)}`;
            return userCode === normalizedCode;
        });

        if (referrer) {
            console.log(`Referrer found: ${referrer.username}`);
            const REWARD_POINTS = 50;
            newUser.boostPoints = (newUser.boostPoints || 0) + REWARD_POINTS;
            
            // Update referrer in the mock DB
            const referrerIndex = MOCK_USERS.findIndex(u => u.id === referrer.id);
            if (referrerIndex !== -1) {
                MOCK_USERS[referrerIndex].boostPoints = (MOCK_USERS[referrerIndex].boostPoints || 0) + REWARD_POINTS;
            }
        } else {
             console.warn(`Invitation code "${normalizedCode}" not found.`);
        }
    }


    MOCK_USERS.push(newUser);
    saveUsersToDb();
    localStorage.setItem(JWT_KEY, JSON.stringify(newUser));
    notifyAuthChange(newUser);
    return newUser;
};

export const logout = async (): Promise<void> => {
    await simulateDelay(200);
    localStorage.removeItem(JWT_KEY);
    notifyAuthChange(null);
};

export const getCurrentUser = async (): Promise<User | null> => {
    await simulateDelay(100);
    const token = localStorage.getItem(JWT_KEY);
    if (token) {
        try {
            const user = JSON.parse(token) as User;
            const userFromDb = MOCK_USERS.find(u => u.id === user.id) || user;
            return {
                ...userFromDb,
                followersCount: calculateFollowersCount(user.id),
            };
        } catch (e) {
            return null;
        }
    }
    return null;
};
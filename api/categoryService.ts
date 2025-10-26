import { getCurrentUser } from './authService';
import { simulateDelay } from './mockData';
import { DEFAULT_CATEGORIES, CATEGORIES_STORAGE_KEY } from '../constants/categories';
import type { FullUser } from '../types';

export interface CategoryTree {
    [key: string]: CategoryTree;
}

/**
 * Fetches the category tree.
 * Simulates reading from a local cache or a fast remote config service.
 * If no dynamic categories are found in localStorage, it initializes them with the default set.
 */
export const getCategories = async (): Promise<CategoryTree> => {
    await simulateDelay(50);
    const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (storedCategories) {
        return JSON.parse(storedCategories);
    } else {
        // Initialize with default categories if none exist
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
    }
};

/**
 * Saves the updated category tree.
 * This is an admin-only action and simulates updating a central configuration.
 * It includes a permission check to ensure only authorized admins can make changes.
 */
export const saveCategories = async (categories: CategoryTree): Promise<void> => {
    await simulateDelay(400);
    const currentUser = await getCurrentUser() as FullUser | null;
    
    // Permission Check: Only Super Admins or Policy Admins can modify categories.
    const canEditCategories = currentUser?.role === 'super_admin' || currentUser?.role === 'policy_admin';

    if (!canEditCategories) {
        throw new Error("Unauthorized: You do not have permission to manage categories.");
    }

    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    // In a real app, this would also trigger a notification to other clients to refresh their category data.
};

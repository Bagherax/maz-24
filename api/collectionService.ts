import type { User, AdCollection } from '../types';
import { getAndSaveUser, simulateDelay } from './mockData';

export const createCollection = async (name: string): Promise<User> => {
    await simulateDelay(300);
    return getAndSaveUser(user => {
        const collections = user.collections || [];
        const newCollection: AdCollection = {
            id: `coll-${Date.now()}`,
            name,
            adIds: [],
        };
        return { ...user, collections: [...collections, newCollection] };
    });
};

export const renameCollection = async (collectionId: string, newName: string): Promise<User> => {
    await simulateDelay(300);
    return getAndSaveUser(user => {
        const collections = user.collections || [];
        const collectionIndex = collections.findIndex(c => c.id === collectionId);
        if (collectionIndex === -1) throw new Error("Collection not found.");
        collections[collectionIndex].name = newName;
        return { ...user, collections };
    });
};

export const deleteCollection = async (collectionId: string): Promise<User> => {
    await simulateDelay(300);
    return getAndSaveUser(user => {
        const collections = (user.collections || []).filter(c => c.id !== collectionId);
        return { ...user, collections };
    });
};

export const moveAdToCollection = async (adId: string, toCollectionId: string | null): Promise<User> => {
    await simulateDelay(400);
    return getAndSaveUser(user => {
        let collections = user.collections || [];
        // First, remove the ad from any collection it might be in
        collections = collections.map(c => ({
            ...c,
            adIds: c.adIds.filter(id => id !== adId),
        }));

        // Then, add it to the new collection (if one is provided)
        if (toCollectionId) {
            const toCollectionIndex = collections.findIndex(c => c.id === toCollectionId);
            if (toCollectionIndex !== -1) {
                collections[toCollectionIndex].adIds.push(adId);
            }
        }
        return { ...user, collections };
    });
};

export const reorderAdInCollection = async (adId: string, collectionId: string, direction: 'up' | 'down'): Promise<User> => {
    await simulateDelay(200);
    return getAndSaveUser(user => {
        const collections = user.collections || [];
        const collectionIndex = collections.findIndex(c => c.id === collectionId);
        if (collectionIndex === -1) throw new Error("Collection not found.");

        const adIds = collections[collectionIndex].adIds;
        const adIndex = adIds.indexOf(adId);
        if (adIndex === -1) throw new Error("Ad not found in collection.");

        if (direction === 'up' && adIndex > 0) {
            [adIds[adIndex], adIds[adIndex - 1]] = [adIds[adIndex - 1], adIds[adIndex]];
        } else if (direction === 'down' && adIndex < adIds.length - 1) {
            [adIds[adIndex], adIds[adIndex + 1]] = [adIds[adIndex + 1], adIds[adIndex]];
        }
        
        collections[collectionIndex].adIds = adIds;
        return { ...user, collections };
    });
};
import React, { useState, useMemo } from 'react';
// FIX: Imported the 'User' type to resolve a type error in the 'handleApiCall' function.
import type { View, Ad, FullUser, AdCollection, User } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { MyAdCard } from './MyAdCard';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { VIEWS } from '../../constants/views';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';

interface ManageListingsProps {
    setActiveView: (view: View) => void;
}

const CollectionHeader: React.FC<{
    collection: AdCollection;
    onRename: (id: string, name: string) => void;
    onDelete: (id: string) => void;
}> = ({ collection, onRename, onDelete }) => {
    const handleRename = () => {
        const newName = prompt("Enter new collection name:", collection.name);
        if (newName && newName.trim()) {
            onRename(collection.id, newName.trim());
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the "${collection.name}" collection? Ads within it will become uncategorized.`)) {
            onDelete(collection.id);
        }
    };
    
    return (
        <div className="flex items-center justify-between mb-3 group">
            <h3 className="text-xl font-bold text-text-primary">{collection.name}</h3>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleRename} className="p-1.5 text-text-secondary hover:text-accent"><PencilIcon /></button>
                <button onClick={handleDelete} className="p-1.5 text-text-secondary hover:text-red-500"><TrashIcon /></button>
            </div>
        </div>
    );
};


const ManageListings: React.FC<ManageListingsProps> = ({ setActiveView }) => {
    const { myAds, loading, error, refreshMarketplaceData } = useMarketplace();
    const { identity, updateCurrentUser } = useAuth();
    const { addNotification } = useNotification();
    const [isCreating, setIsCreating] = useState(false);
    const currentUser = identity as FullUser | null;
    const collections = currentUser?.collections || [];

    const handleApiCall = async (apiFunc: () => Promise<User>) => {
        try {
            const updatedUser = await apiFunc();
            updateCurrentUser(updatedUser);
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'An error occurred.', 'error');
        }
    };

    const handleCreateCollection = async () => {
        const name = prompt("Enter the name for your new collection:");
        if (name && name.trim()) {
            setIsCreating(true);
            await handleApiCall(() => api.createCollection(name.trim()));
            setIsCreating(false);
        }
    };

    const adsByCollection = useMemo(() => {
        const grouped: { [key: string]: Ad[] } = {};
        collections.forEach(c => grouped[c.id] = []);
        let uncategorized: Ad[] = [];
        
        const allAdIdsInCollections = new Set(collections.flatMap(c => c.adIds));
        
        uncategorized = myAds.filter(ad => !allAdIdsInCollections.has(ad.id));

        collections.forEach(collection => {
            const adsForCollection: Ad[] = [];
            collection.adIds.forEach(adId => {
                const ad = myAds.find(a => a.id === adId);
                if (ad) {
                    adsForCollection.push(ad);
                }
            });
            grouped[collection.id] = adsForCollection;
        });

        return { grouped, uncategorized };
    }, [myAds, collections]);
    
    const findCollectionForAd = (adId: string) => collections.find(c => c.adIds.includes(adId));

    const onActionComplete = () => {
        // updateCurrentUser has been called by handleApiCall, but we also need to refresh the ads list.
        refreshMarketplaceData();
    };

    return (
        <div>
            <div className="sticky top-0 z-10 bg-primary py-4 border-b border-border-color -mx-4 px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => setActiveView(VIEWS.PROFILE)} className="p-2 rounded-full hover:bg-secondary">
                            <ChevronLeftIcon />
                        </button>
                        <h2 className="text-2xl font-bold text-text-primary ml-2">Organize Listings</h2>
                    </div>
                    <button onClick={handleCreateCollection} disabled={isCreating} className="px-3 py-1.5 text-sm font-semibold rounded-full bg-accent text-white hover:bg-accent-hover disabled:opacity-50">
                        {isCreating ? '...' : '+ New Collection'}
                    </button>
                </div>
            </div>

            <div className="pt-4">
                {loading && <LoadingSpinner />}
                {error && <div className="text-center text-red-500 mt-8">{error}</div>}

                {!loading && !error && (
                    <div className="space-y-8">
                        {collections.map(collection => (
                            <div key={collection.id}>
                                <CollectionHeader 
                                    collection={collection} 
                                    onRename={(id, name) => handleApiCall(() => api.renameCollection(id, name))} 
                                    onDelete={(id) => handleApiCall(() => api.deleteCollection(id))}
                                />
                                <div className="space-y-4">
                                    {adsByCollection.grouped[collection.id]?.map(ad => (
                                        <MyAdCard key={ad.id} ad={ad} currentCollectionId={collection.id} onActionComplete={onActionComplete} />
                                    ))}
                                    {adsByCollection.grouped[collection.id]?.length === 0 && <p className="text-sm text-text-secondary pl-4">No ads in this collection yet.</p>}
                                </div>
                            </div>
                        ))}
                        
                        <div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Uncategorized</h3>
                             <div className="space-y-4">
                                {adsByCollection.uncategorized.length > 0 ? (
                                    adsByCollection.uncategorized.map(ad => (
                                        <MyAdCard key={ad.id} ad={ad} currentCollectionId={null} onActionComplete={onActionComplete} />
                                    ))
                                ) : myAds.length > 0 && collections.length === 0 ? (
                                    <p className="text-sm text-text-secondary">All your ads are here. Create a collection to start organizing!</p>
                                ) : (
                                     <p className="text-sm text-text-secondary">No uncategorized ads.</p>
                                )}
                            </div>
                        </div>

                        {myAds.length === 0 && (
                             <div className="text-center py-10 text-text-secondary bg-secondary rounded-lg">
                                <p>You haven't created any ads yet.</p>
                                <button 
                                    onClick={() => setActiveView(VIEWS.CREATE_AD)} 
                                    className="mt-4 px-4 py-2 text-sm font-medium rounded-full bg-accent text-white"
                                >
                                    Create Your First Ad
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageListings;
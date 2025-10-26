import React, { useState, useEffect, useMemo } from 'react';
import { useSellerProfile } from '../../context/SellerProfileContext';
import * as api from '../../api';
import type { User, Ad } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { XMarkIcon } from '../../components/icons/XMarkIcon';
import PublicSellerReviews from '../marketplace/PublicSellerReviews';
import AdCard from '../../components/ui/AdCard';
import { StarRatingDisplay } from '../../components/ui/StarRatingDisplay';
import { VerifiedSealIcon } from '../../components/icons/VerifiedSealIcon';
import { FollowButton } from '../../components/ui/FollowButton';

const SellerProfileSheet: React.FC = () => {
    const { activeSellerId, closeSellerProfile } = useSellerProfile();
    const [seller, setSeller] = useState<User | null>(null);
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(false);
    
    const isVisible = !!activeSellerId;

    useEffect(() => {
        if (activeSellerId) {
            const fetchSellerData = async () => {
                setLoading(true);
                try {
                    const [userData, userAds] = await Promise.all([
                        api.getUserById(activeSellerId),
                        api.getAdsBySellerId(activeSellerId)
                    ]);
                    setSeller(userData);
                    setAds(userAds);
                } catch (e) {
                    console.error("Failed to fetch seller data", e);
                    setSeller(null);
                    setAds([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchSellerData();
        } else {
            setSeller(null);
            setAds([]);
        }
    }, [activeSellerId]);
    
    const adsByCollection = useMemo(() => {
        if (!seller) return { grouped: {}, uncategorized: [] };
        
        const collections = seller.collections || [];
        const grouped: { [key: string]: Ad[] } = {};
        collections.forEach(c => grouped[c.id] = []);
        
        const allAdIdsInCollections = new Set(collections.flatMap(c => c.adIds));
        const uncategorized = ads.filter(ad => !allAdIdsInCollections.has(ad.id));

        collections.forEach(collection => {
            const adsForCollection: Ad[] = [];
            collection.adIds.forEach(adId => {
                const ad = ads.find(a => a.id === adId);
                if (ad) {
                    adsForCollection.push(ad);
                }
            });
            grouped[collection.id] = adsForCollection;
        });

        return { grouped, uncategorized };
    }, [ads, seller]);

    const tierColor: { [key: string]: string } = {
        normal: 'bg-gray-500 text-white',
        bronze: 'bg-yellow-700 text-white',
        silver: 'bg-gray-400 text-white',
        gold: 'bg-yellow-500 text-white',
        platinum: 'bg-blue-300 text-white',
        diamond: 'bg-cyan-400 text-white',
        su_diamond: 'bg-purple-500 text-white',
        MAZ: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
    };

    return (
      <>
        <div onClick={closeSellerProfile} className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      
        <div className={`fixed bottom-0 left-0 right-0 z-[70] bg-primary rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out flex flex-col md:left-auto md:right-auto md:w-full md:max-w-md md:mx-auto ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: '90vh', maxHeight: '90vh' }} role="dialog">
            <div className="flex-shrink-0 p-2 border-b border-border-color flex items-center justify-between relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1.5 bg-border-color rounded-full" />
               <button onClick={closeSellerProfile} className="ml-auto p-2 rounded-full hover:bg-secondary">
                    <XMarkIcon />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading && <div className="pt-20"><LoadingSpinner /></div>}
                {!loading && seller && (
                    <div className="space-y-6">
                        <section className="flex flex-col items-center text-center">
                            <img src={seller.avatarUrl} alt={seller.username} className="w-24 h-24 rounded-full border-4 border-accent shadow-lg" />
                            <h2 className="text-2xl font-bold text-text-primary mt-4 flex items-center">
                                {seller.username}
                                {seller.isVerified && <span className="ml-2 text-blue-400"><VerifiedSealIcon /></span>}
                            </h2>
                            <div className={`mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full ${tierColor[seller.tier]}`}>
                                {seller.tier.toUpperCase()} Member
                            </div>
                        </section>

                        <section className="grid grid-cols-3 gap-4 text-center px-4 py-3 bg-secondary rounded-xl">
                            <div>
                                <p className="text-lg font-bold text-text-primary">{ads.length}</p>
                                <p className="text-xs text-text-secondary">Listings</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-text-primary">{seller.followersCount || 0}</p>
                                <p className="text-xs text-text-secondary">Followers</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-text-primary">{seller.followingIds?.length || 0}</p>
                                <p className="text-xs text-text-secondary">Following</p>
                            </div>
                        </section>

                        <section>
                            <FollowButton sellerId={seller.id} className="w-full p-3" />
                        </section>
                        
                        {(seller.totalReviews ?? 0) > 0 && (
                             <section className="flex items-center justify-center p-3 bg-secondary rounded-lg">
                                <StarRatingDisplay rating={seller.averageRating || 0} />
                                <span className="ml-2 font-bold text-text-primary">{seller.averageRating?.toFixed(1)}</span>
                                <span className="ml-1 text-text-secondary">({seller.totalReviews} reviews)</span>
                            </section>
                        )}
                        
                        <section>
                            <PublicSellerReviews seller={seller} />
                        </section>
                        
                        <section className="space-y-6">
                            {(seller.collections || []).map(collection => {
                                const collectionAds = adsByCollection.grouped[collection.id];
                                if (!collectionAds || collectionAds.length === 0) return null;
                                return (
                                    <div key={collection.id}>
                                        <h3 className="text-lg font-bold text-text-primary mb-3">{collection.name}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {collectionAds.map(ad => <AdCard key={ad.id} ad={ad} viewMode="grid" />)}
                                        </div>
                                    </div>
                                );
                            })}

                            {adsByCollection.uncategorized.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary mb-3">Other Listings</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {adsByCollection.uncategorized.map(ad => <AdCard key={ad.id} ad={ad} viewMode="grid" />)}
                                    </div>
                                </div>
                            )}

                             {ads.length === 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary mb-3">Listings</h3>
                                    <p className="text-sm text-text-secondary text-center py-4">This seller has no public listings.</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}
                 {!loading && !seller && isVisible && (
                     <div className="text-center text-text-secondary pt-20">Could not load seller profile.</div>
                 )}
            </div>
        </div>
      </>
    );
};

export default SellerProfileSheet;
import React, { useState, useEffect } from 'react';
import type { View, Ad } from '../../types';
import * as api from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { VIEWS } from '../../constants/views';
import PromotionAdCard from './PromotionAdCard';
import { useMarketplace } from '../../hooks/useMarketplace';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';

interface PromotionCenterProps {
    adId: string | null;
    setActiveView: (view: View) => void;
}

const PromotionCenter: React.FC<PromotionCenterProps> = ({ adId, setActiveView }) => {
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const { refreshMarketplaceData } = useMarketplace();

    useEffect(() => {
        if (!adId) {
            // If no ad ID is provided, redirect to manage listings
            setActiveView(VIEWS.MANAGE_LISTINGS);
            return;
        }

        const fetchAd = async () => {
            setLoading(true);
            // The ad is new and local, so it will be in `getMyAds`
            const myAds = await api.getMyAds();
            const foundAd = myAds.find(a => a.id === adId);
            setAd(foundAd || null);
            setLoading(false);
        };

        fetchAd();
    }, [adId, setActiveView]);

    const handleActionComplete = () => {
        // Refresh all data, which will update boost scores everywhere
        refreshMarketplaceData();
        // After an action, just stay on this page but re-fetch the ad to show new score
        const fetchAd = async () => {
            const myAds = await api.getMyAds();
            const foundAd = myAds.find(a => a.id === adId);
            setAd(foundAd || null);
        };
        fetchAd();
    };

    const handleSkip = () => {
        setActiveView(VIEWS.MANAGE_LISTINGS);
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!ad) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                 <h2 className="text-2xl font-bold text-text-primary">Ad Not Found</h2>
                 <p className="text-text-secondary mt-2">The ad you are trying to promote could not be found.</p>
                 <button onClick={() => setActiveView(VIEWS.MANAGE_LISTINGS)} className="mt-6 px-4 py-2 bg-accent text-white rounded-lg">Go to My Listings</button>
            </div>
        );
    }

    return (
        <div className="py-4">
             <div className="flex items-center mb-6">
                <button onClick={handleSkip} className="p-2 rounded-full hover:bg-secondary">
                    <ChevronLeftIcon />
                </button>
                <h2 className="text-2xl font-bold text-text-primary ml-2">Activate Your Ad</h2>
            </div>

            <div className="max-w-md mx-auto">
                 <div className="text-center mb-6 p-4 bg-green-900/50 rounded-lg">
                    <h3 className="text-xl font-bold text-green-300">Success!</h3>
                    <p className="text-green-200/80 mt-1">Your ad has been created as a local draft. Give it a boost to make it visible to others!</p>
                </div>
                
                <PromotionAdCard ad={ad} onActionComplete={handleActionComplete} />

                <div className="text-center mt-6">
                     <button onClick={handleSkip} className="text-sm font-semibold text-text-secondary hover:underline">
                        Skip for now, I'll do it later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionCenter;
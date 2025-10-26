import React, { useState } from 'react';
import type { Ad } from '../../types';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';
import SocialBoosterModal from '../manage-listings/SocialBoosterModal';
import { RocketIcon } from '../../components/icons/RocketIcon';
import { CurrencyDollarIcon } from '../../components/icons/CurrencyDollarIcon';

interface PromotionAdCardProps {
    ad: Ad;
    onActionComplete: () => void;
}

const PromotionAdCard: React.FC<PromotionAdCardProps> = ({ ad, onActionComplete }) => {
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState<string | null>(null);
    const [isSocialBoosterOpen, setIsSocialBoosterOpen] = useState(false);
    
    const thumbnailUrl = ad.media && ad.media.length > 0 ? (ad.media[0].thumbnailUrl || ad.media[0].url) : '';

    const handlePaidPromote = async () => {
        if (!window.confirm("This is a simulated $10.00 payment to boost your ad. Continue?")) {
            return;
        }
        setLoading('paid');
        try {
            const updatedAd = await api.promoteAd(ad.id);
            addNotification(`Successfully promoted "${updatedAd.title}"! New score: ${updatedAd.boostScore}`, 'success');
            onActionComplete();
        } catch(err) {
            const message = err instanceof Error ? err.message : 'Promotion failed.';
            addNotification(message, 'error');
        } finally {
            setLoading(null);
        }
    };

    const handleSocialBoostComplete = () => {
        setIsSocialBoosterOpen(false);
        onActionComplete();
    };

    return (
        <>
            <div className="bg-secondary rounded-lg border border-border-color p-3 flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                    <img src={thumbnailUrl} alt={ad.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-primary" />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary truncate">{ad.title}</h3>
                        <div className="mt-1 flex items-center text-yellow-400">
                           <RocketIcon className="h-4 w-4" />
                           <span className="ml-1.5 font-bold text-sm">{ad.boostScore || 0}</span>
                           <span className="text-xs text-text-secondary ml-1">Boost Score</span>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center space-x-2">
                    <button 
                        onClick={handlePaidPromote} 
                        disabled={!!loading}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-md transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                         {loading === 'paid' ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <CurrencyDollarIcon />
                                <span className="ml-2">Pay to Promote (+100)</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={() => setIsSocialBoosterOpen(true)}
                        disabled={!!loading}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                         {loading === 'social' ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <RocketIcon className="h-5 w-5" />
                                <span className="ml-2">Social Boost (+10)</span>
                            </>
                        )}
                    </button>
                 </div>
            </div>
             {isSocialBoosterOpen && <SocialBoosterModal ad={ad} onClose={() => setIsSocialBoosterOpen(false)} onComplete={handleSocialBoostComplete} />}
        </>
    );
};

export default PromotionAdCard;
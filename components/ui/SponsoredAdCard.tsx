import React, { useEffect, useRef } from 'react';
import type { SponsoredAd, AdPlacement } from '../../types';
import * as api from '../../api';

interface SponsoredAdCardProps {
    ad: SponsoredAd;
    placement: AdPlacement;
    organicAdId?: string; // For tracking context
}

const SponsoredAdCard: React.FC<SponsoredAdCardProps> = ({ ad, placement, organicAdId }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const hasTrackedImpression = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Track impression when the card is 50% visible
                if (entry.isIntersecting && !hasTrackedImpression.current) {
                    api.trackImpression(ad.id, placement, organicAdId);
                    hasTrackedImpression.current = true; // Track only once per render
                    observer.disconnect(); // Stop observing after tracking
                }
            },
            { threshold: 0.5 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, [ad.id, placement, organicAdId]);

    const handleClick = () => {
        api.trackClick(ad.id, placement, organicAdId);
        window.open(ad.linkUrl, '_blank');
    };

    return (
        <div ref={cardRef} className="bg-secondary rounded-lg overflow-hidden shadow-lg border border-yellow-500/50 group text-left relative">
            <button onClick={handleClick} className="w-full">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity" />
                <div className="p-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-text-primary truncate">{ad.title}</h3>
                        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">Sponsored</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{ad.advertiser}</p>
                </div>
            </button>
        </div>
    );
};

export default SponsoredAdCard;

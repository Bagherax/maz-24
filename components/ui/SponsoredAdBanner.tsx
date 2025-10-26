import React, { useEffect, useRef } from 'react';
import type { SponsoredAd, AdPlacement } from '../../types';
import * as api from '../../api';

interface SponsoredAdBannerProps {
    ad: SponsoredAd;
    placement: AdPlacement;
    organicAdId?: string;
}

const SponsoredAdBanner: React.FC<SponsoredAdBannerProps> = ({ ad, placement, organicAdId }) => {
    const bannerRef = useRef<HTMLDivElement>(null);
    const hasTrackedImpression = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTrackedImpression.current) {
                    api.trackImpression(ad.id, placement, organicAdId);
                    hasTrackedImpression.current = true;
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (bannerRef.current) {
            observer.observe(bannerRef.current);
        }

        return () => {
             if (bannerRef.current) {
                observer.unobserve(bannerRef.current);
            }
        };
    }, [ad.id, placement, organicAdId]);

    const handleClick = () => {
        api.trackClick(ad.id, placement, organicAdId);
        window.open(ad.linkUrl, '_blank');
    };

    return (
        <div ref={bannerRef} className="bg-secondary rounded-lg overflow-hidden border border-yellow-500/50 group">
            <button onClick={handleClick} className="w-full flex items-center p-3 text-left">
                <img src={ad.imageUrl} alt={ad.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                         <p className="text-xs text-text-secondary">{ad.advertiser}</p>
                         <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">Sponsored</span>
                    </div>
                    <h4 className="font-semibold text-text-primary mt-1">{ad.title}</h4>
                </div>
            </button>
        </div>
    );
};

export default SponsoredAdBanner;

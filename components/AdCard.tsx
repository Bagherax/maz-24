import React from 'react';
import type { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
}

const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg border border-border-color group">
      {/* FIX: Replaced deprecated 'ad.imageUrls' with 'ad.media' to match the updated 'Ad' type. */}
      <img src={ad.media?.[0]?.url || 'https://picsum.photos/seed/placeholder/400/300'} alt={ad.title} className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity" />
      <div className="p-3">
        <h3 className="font-semibold text-sm text-text-primary truncate">{ad.title}</h3>
        <p className="text-xs text-text-secondary mt-1">{ad.seller.username}</p>
        <p className="text-base font-bold text-accent mt-2">${ad.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default AdCard;
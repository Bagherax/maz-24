import React, { useState } from 'react';
import type { Ad, FullUser, Media } from '../../types';
import { useAdDetail } from '../../context/AdDetailContext';
import { LocationPinIcon } from '../icons/LocationPinIcon';
import type { ViewMode } from '../../context/MarketplaceContext';
import { useSellerProfile } from '../../context/SellerProfileContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import * as api from '../../api';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { UserCheckIcon } from '../icons/UserCheckIcon';
import { PlayIcon } from '../icons/PlayIcon';
import { StarRatingDisplay } from './StarRatingDisplay';

interface AdCardProps {
  ad: Ad;
  viewMode: ViewMode;
}

const getAdThumbnail = (ad: Ad): { url: string; isVideo: boolean } => {
  if (!ad.media || ad.media.length === 0) {
    return { url: 'https://picsum.photos/seed/placeholder/400/300', isVideo: false };
  }
  const firstMedia = ad.media[0];
  switch (firstMedia.type) {
    case 'image':
      return { url: firstMedia.url, isVideo: false };
    case 'video':
    case 'youtube':
      return { url: firstMedia.thumbnailUrl || 'https://picsum.photos/seed/video_thumb/400/300', isVideo: true };
    case 'pdf':
      // In a real app, you'd have a static icon asset
      return { url: `https://picsum.photos/seed/pdf_icon/400/300?text=${firstMedia.fileName}`, isVideo: false };
    default:
      return { url: 'https://picsum.photos/seed/placeholder/400/300', isVideo: false };
  }
};

const AdCardFollowButton: React.FC<{ sellerId: string }> = ({ sellerId }) => {
    const { identity, updateCurrentUser, promptForIdentity } = useAuth();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const isOwnAd = identity?.type === 'FULL_USER' && identity.id === sellerId;
    if (isOwnAd) return null;

    const isFollowing = (identity as FullUser)?.followingIds?.includes(sellerId) || false;

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!identity) {
            promptForIdentity();
            return;
        }
        if (identity.type !== 'FULL_USER') return;

        setLoading(true);
        try {
            const updatedUser = isFollowing
                ? await api.unfollowUser(sellerId)
                : await api.followUser(sellerId);
            
            updateCurrentUser(updatedUser);
        } catch (error) {
            addNotification(error instanceof Error ? error.message : 'Action failed', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/60 rounded-full">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <button 
            onClick={handleClick}
            className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
            title={isFollowing ? 'Unfollow' : 'Follow'}
        >
            {isFollowing ? <UserCheckIcon className="h-5 w-5" /> : <UserPlusIcon className="h-5 w-5" />}
        </button>
    )
}

const AdCard: React.FC<AdCardProps> = ({ ad, viewMode }) => {
  const { openAdDetail } = useAdDetail();
  const { openSellerProfile } = useSellerProfile();
  const { url: thumbnailUrl, isVideo } = getAdThumbnail(ad);

  const handleCardClick = () => {
    openAdDetail(ad.id);
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the ad detail sheet
    openSellerProfile(ad.seller.id);
  };
  
  const sellerHasReviews = ad.seller.totalReviews && ad.seller.totalReviews > 0;

  if (viewMode === 'large') {
    return (
        <button onClick={handleCardClick} className="w-full bg-secondary rounded-lg overflow-hidden shadow-lg border border-border-color group text-left flex flex-col relative">
            <AdCardFollowButton sellerId={ad.seller.id} />
            <div className="relative w-full h-48">
                <img src={thumbnailUrl} alt={ad.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                {isVideo && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><PlayIcon /></div>}
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm text-text-primary">{ad.title}</h3>
                <p className="text-xs text-text-secondary mt-1 flex items-center"><LocationPinIcon /><span className="ml-1">{ad.location}</span></p>
                <p className="text-lg font-bold text-accent mt-2">${ad.price.toFixed(2)}</p>
                <div className="mt-auto pt-2 flex items-center justify-between border-t border-border-color">
                    <div className="flex items-center">
                        <img src={ad.seller.avatarUrl} alt={ad.seller.username} className="w-6 h-6 rounded-full" />
                        <button onClick={handleSellerClick} className="ml-2 text-xs text-text-secondary hover:underline">{ad.seller.username}</button>
                    </div>
                     {sellerHasReviews && (
                        <div className="flex items-center text-xs">
                            <StarRatingDisplay rating={ad.seller.averageRating || 0} />
                            <span className="ml-1.5 font-bold text-text-primary">{ad.seller.averageRating?.toFixed(1)}</span>
                            <span className="ml-1 text-text-secondary/80">({ad.seller.totalReviews})</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
  }

  return (
    <button onClick={handleCardClick} className="w-full bg-secondary rounded-lg overflow-hidden shadow-lg border border-border-color group text-left relative">
      <AdCardFollowButton sellerId={ad.seller.id} />
      <div className="relative w-full h-32">
        <img src={thumbnailUrl} alt={ad.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
        {isVideo && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><PlayIcon /></div>}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-text-primary truncate">{ad.title}</h3>
        <p className="text-base font-bold text-accent mt-2">${ad.price.toFixed(2)}</p>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-color">
            <button onClick={handleSellerClick} className="text-xs text-text-secondary truncate hover:underline">{ad.seller.username}</button>
            {sellerHasReviews && (
                <div className="flex items-center text-xs flex-shrink-0 ml-2">
                    <StarRatingDisplay rating={ad.seller.averageRating || 0} />
                    <span className="ml-1 font-bold text-text-primary">{ad.seller.averageRating?.toFixed(1)}</span>
                    <span className="ml-1 text-text-secondary/80">({ad.seller.totalReviews})</span>
                </div>
            )}
        </div>
      </div>
    </button>
  );
};

export default AdCard;
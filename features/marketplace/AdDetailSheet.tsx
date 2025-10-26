import React, { useState, useEffect, useRef } from 'react';
import { useAdDetail } from '../../context/AdDetailContext';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import * as api from '../../api';
import type { Ad, SponsoredAd } from '../../types';

// UI & Placeholders
import MediaCarousel from '../../components/ui/MediaCarousel';
import Tag from '../../components/ui/Tag';
import MapPlaceholder from './MapPlaceholder';
import PublicSellerReviews from './PublicSellerReviews';
import { StarRatingDisplay } from '../../components/ui/StarRatingDisplay';
import { FollowButton } from '../../components/ui/FollowButton';
import SponsoredAdBanner from '../../components/ui/SponsoredAdBanner';


// Icons
import { LocationPinIcon } from '../../components/icons/LocationPinIcon';
import { MailIcon } from '../../components/icons/MailIcon';
import { ShareIcon } from '../../components/icons/ShareIcon';
import { FavoriteIcon } from '../../components/icons/FavoriteIcon';
import { VerifiedSealIcon } from '../../components/icons/VerifiedSealIcon';
import { FlagIcon } from '../../components/icons/FlagIcon';
import { XMarkIcon } from '../../components/icons/XMarkIcon';
import { useSellerProfile } from '../../context/SellerProfileContext';
import { VIEWS } from '../../constants/views';

const StickyHeader: React.FC<{ ad: Ad; onContact: () => void; isOwnAd: boolean }> = ({ ad, onContact, isOwnAd }) => (
  <div className="sticky top-0 z-20 flex-shrink-0 bg-secondary/80 backdrop-blur-md border-b border-border-color flex items-center justify-between p-2">
    <div className="flex items-center min-w-0">
      <img src={ad.media[0]?.thumbnailUrl || ad.media[0]?.url} alt={ad.title} className="w-10 h-10 rounded-md object-cover" />
      <div className="ml-3 min-w-0">
        <h3 className="text-sm font-bold text-text-primary truncate">{ad.title}</h3>
        <p className="text-sm font-bold text-accent">{`$${ad.price.toFixed(2)}`}</p>
      </div>
    </div>
    <button
      onClick={onContact}
      disabled={isOwnAd}
      className="flex-shrink-0 ml-2 px-3 py-2 text-xs font-semibold rounded-lg text-white bg-accent hover:bg-accent-hover disabled:bg-border-color disabled:text-text-secondary"
    >
      {isOwnAd ? "Your Ad" : "Chat"}
    </button>
  </div>
);

const AdDetailSheet: React.FC = () => {
  const { activeAdId, closeAdDetail } = useAdDetail();
  const { ads, myAds } = useMarketplace();
  const { identity, promptForIdentity } = useAuth();
  const { addNotification } = useNotification();
  const { openSellerProfile } = useSellerProfile();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [sponsoredAd, setSponsoredAd] = useState<SponsoredAd | null>(null);

  const uniqueAdsMap = new Map([...ads, ...myAds].map(ad => [ad.id, ad]));
  const ad = activeAdId ? uniqueAdsMap.get(activeAdId) : null;
  
  const isOwnAd = !!(identity?.type === 'FULL_USER' && ad && identity.id === ad.seller.id);
  const isVisible = !!ad;

  useEffect(() => {
    const fetchSponsorAd = async () => {
      if (isVisible) {
        const sponsorAds = await api.getSponsoredAds();
        setSponsoredAd(sponsorAds.length > 0 ? sponsorAds[0] : null);
      }
    };
    fetchSponsorAd();
  }, [isVisible]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const threshold = window.innerHeight * 0.35; // A bit less than carousel height
        setShowStickyHeader(scrollRef.current.scrollTop > threshold);
      }
    };

    const scrollableElement = scrollRef.current;
    if (isVisible && scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
      return () => scrollableElement.removeEventListener('scroll', handleScroll);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setShowStickyHeader(false);
      setIsDescriptionExpanded(false);
    }
  }, [activeAdId, isVisible]);

  const handleContactSeller = async () => {
    if (!ad || isOwnAd) return;

    // For guests, navigate directly to the chat screen with necessary context.
    // The Conversation component will handle the identity prompt on send.
    if (!identity) {
        closeAdDetail();
        window.dispatchEvent(new CustomEvent('navigateTo', {
            detail: {
                view: VIEWS.CHAT,
                payload: { 
                    recipient: ad.seller,
                    relatedAdId: ad.id,
                    relatedAdTitle: ad.title
                }
            }
        }));
        return;
    }

    // Existing logic for logged-in users
    try {
        const conversationId = await api.startConversationWithSeller(ad.seller, ad.id, ad.title);
        addNotification(`Conversation started with ${ad.seller.username}.`, 'success');
        
        closeAdDetail();

        window.dispatchEvent(new CustomEvent('navigateTo', {
            detail: {
                view: VIEWS.CHAT,
                payload: { conversationId, recipient: ad.seller }
            }
        }));
    } catch (err) {
        addNotification(err instanceof Error ? err.message : 'Could not start chat.', 'error');
    }
  };

  const handleSellerClick = () => {
    if (ad) {
        openSellerProfile(ad.seller.id);
    }
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4 border-t border-border-color">
      <h3 className="text-lg font-bold text-text-primary mb-3">{title}</h3>
      {children}
    </div>
  );

  return (
    <>
      <div onClick={closeAdDetail} className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-primary rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out flex flex-col md:left-auto md:right-auto md:w-full md:max-w-md md:mx-auto ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: '95vh', maxHeight: '95vh' }} role="dialog">
        {ad && (
          <>
            <div className="flex-shrink-0 p-2 border-b border-border-color flex items-center justify-between relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1.5 bg-border-color rounded-full" />
               <button onClick={closeAdDetail} className="ml-auto p-2 rounded-full hover:bg-secondary">
                    <XMarkIcon />
               </button>
            </div>
            
            {showStickyHeader && <StickyHeader ad={ad} onContact={handleContactSeller} isOwnAd={isOwnAd} />}

            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <MediaCarousel media={ad.media} sponsoredAd={sponsoredAd || undefined} organicAdId={ad.id} />
              
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Tag>{ad.condition.charAt(0).toUpperCase() + ad.condition.slice(1)}</Tag>
                        {ad.listingType === 'auction' && <Tag className="text-accent border-accent/50 bg-accent/10">Auction</Tag>}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="text-text-secondary hover:text-accent"><FavoriteIcon /></button>
                        <button className="text-text-secondary hover:text-accent"><ShareIcon /></button>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-text-primary">{ad.title}</h2>
                <p className="text-3xl font-extrabold text-accent">${ad.price.toFixed(2)}</p>
                <div className="flex items-center text-sm text-text-secondary">
                    <LocationPinIcon />
                    <span className="ml-1.5">{ad.location}</span>
                </div>
              </div>

              <div className="px-4">
                <Section title="Description">
                    <p className={`text-sm text-text-secondary whitespace-pre-wrap ${!isDescriptionExpanded && 'line-clamp-4'}`}>{ad.description}</p>
                    <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="text-accent text-sm font-semibold mt-2">
                        {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                    </button>
                </Section>
                
                {sponsoredAd && (
                   <div className="py-4 border-t border-border-color">
                     <SponsoredAdBanner ad={sponsoredAd} placement="Under Description" organicAdId={ad.id} />
                   </div>
                )}
                
                <Section title="About Seller">
                    <div className="p-3 bg-secondary rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <button onClick={handleSellerClick} className="flex items-center flex-1 min-w-0">
                                <img src={ad.seller.avatarUrl} alt={ad.seller.username} className="w-12 h-12 rounded-full" />
                                <div className="ml-3 text-left">
                                    <p className="font-semibold text-text-primary flex items-center">
                                        {ad.seller.username}
                                        {ad.seller.isVerified && <VerifiedSealIcon />}
                                    </p>
                                    {(ad.seller.totalReviews ?? 0) > 0 ? (
                                        <div className="flex items-center text-xs mt-1">
                                            <StarRatingDisplay rating={ad.seller.averageRating || 0} />
                                            <span className="ml-1.5 font-bold text-text-primary">{ad.seller.averageRating?.toFixed(1)}</span>
                                            <span className="ml-1 text-text-secondary">({ad.seller.totalReviews} reviews)</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-text-secondary">New Seller</p>
                                    )}
                                </div>
                            </button>
                            <div className="ml-2 flex-shrink-0">
                                 <FollowButton sellerId={ad.seller.id} className="px-4 py-2 text-sm" />
                            </div>
                        </div>
                    </div>
                </Section>
                
                <Section title="Location"><MapPlaceholder location={ad.location} /></Section>
                <Section title="Feedback"><PublicSellerReviews seller={ad.seller} /></Section>

                <div className="py-6 flex justify-center">
                    <button className="flex items-center text-sm text-text-secondary hover:text-red-500 transition-colors">
                        <FlagIcon />
                        <span className="ml-2">Report this listing</span>
                    </button>
                </div>
              </div>
            </div>

            {/* Floating Footer */}
            <div className={`absolute bottom-0 left-0 right-0 z-10 transition-transform duration-300 ${showStickyHeader ? 'translate-y-full' : 'translate-y-0'}`}>
                <div className="p-3 bg-primary/80 border-t border-border-color backdrop-blur-sm">
                    <button
                      onClick={handleContactSeller}
                      disabled={isOwnAd}
                      className="w-full flex items-center justify-center p-3 text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-hover disabled:bg-border-color disabled:text-text-secondary disabled:cursor-not-allowed"
                    >
                      <MailIcon />
                      <span className="ml-2 font-semibold">{isOwnAd ? "This is your ad" : "Chat with Seller"}</span>
                    </button>
                </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdDetailSheet;
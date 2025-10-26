import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import type { Media, SponsoredAd } from '../../types';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import * as api from '../../api';

type MediaItem = Media | { type: 'sponsored'; ad: SponsoredAd };

interface MediaCarouselProps {
  media: Media[];
  sponsoredAd?: SponsoredAd;
  organicAdId?: string;
}

const SponsoredAdSlide: React.FC<{ ad: SponsoredAd; organicAdId?: string }> = ({ ad, organicAdId }) => {
    const ref = useRef<HTMLDivElement>(null);
    const hasTrackedImpression = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTrackedImpression.current) {
                    api.trackImpression(ad.id, 'Ad Carousel', organicAdId);
                    hasTrackedImpression.current = true;
                    observer.disconnect();
                }
            },
            { threshold: 0.8 } // Needs to be mostly visible
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ad.id, organicAdId]);

    const handleClick = () => {
        api.trackClick(ad.id, 'Ad Carousel', organicAdId);
        window.open(ad.linkUrl, '_blank');
    };

    return (
        <div ref={ref} className="w-full h-full flex flex-col items-center justify-center bg-secondary cursor-pointer" onClick={handleClick}>
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-contain" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center text-white">
                <p className="text-xs font-bold uppercase tracking-wider">Sponsored</p>
                <p className="text-sm font-semibold">{ad.title}</p>
            </div>
        </div>
    );
};


const MediaCarousel: React.FC<MediaCarouselProps> = ({ media, sponsoredAd, organicAdId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allItems: MediaItem[] = sponsoredAd ? [...media, { type: 'sponsored', ad: sponsoredAd }] : media;

  const goToPrevious = () => {
    const isFirstItem = currentIndex === 0;
    const newIndex = isFirstItem ? allItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastItem = currentIndex === allItems.length - 1;
    const newIndex = isLastItem ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToMedia = (index: number) => {
    setCurrentIndex(index);
  }

  if (!allItems || allItems.length === 0) {
    return <div className="w-full h-[40vh] bg-secondary flex items-center justify-center text-text-secondary">No Media</div>;
  }

  const currentItem = allItems[currentIndex];

  const renderMedia = () => {
    if (currentItem.type === 'sponsored') {
        return <SponsoredAdSlide ad={currentItem.ad} organicAdId={organicAdId} />;
    }
    
    switch(currentItem.type) {
        case 'image':
            return <img src={currentItem.url} alt={`Slide ${currentIndex}`} className="w-full h-full object-contain" />;
        case 'video':
            return <video src={currentItem.url} controls className="w-full h-full object-contain" />;
        case 'youtube':
            return <iframe src={currentItem.url} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>;
        case 'pdf':
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-secondary">
                    <DocumentTextIcon className="h-16 w-16 text-text-secondary" />
                    <p className="mt-2 font-semibold text-text-primary">{currentItem.fileName}</p>
                    <a href={currentItem.url} target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold">
                        View PDF
                    </a>
                </div>
            );
        default:
            return <div className="text-text-secondary">Unsupported media type</div>
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative h-[40vh] overflow-hidden bg-primary">
        {renderMedia()}
        {allItems.length > 1 && (
            <>
                <button onClick={goToPrevious} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10">
                    <ChevronLeftIcon />
                </button>
                <button onClick={goToNext} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10">
                    <ChevronRightIcon />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                    {currentIndex + 1} / {allItems.length}
                </div>
            </>
        )}
      </div>
      {allItems.length > 1 && (
        <div className="flex justify-center p-2 space-x-2 bg-primary overflow-x-auto">
            {allItems.map((item, index) => {
                 const thumbnailUrl = item.type === 'sponsored' ? item.ad.imageUrl : (item.thumbnailUrl || item.url);
                 return (
                    <button key={index} onClick={() => goToMedia(index)} className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${currentIndex === index ? 'border-accent' : 'border-transparent'}`}>
                        <img src={thumbnailUrl} alt={`Thumbnail ${index}`} className="w-full h-full object-cover bg-secondary" />
                        {item.type === 'sponsored' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">AD</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;

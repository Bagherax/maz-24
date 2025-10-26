export type AdPlacement = 'Marketplace Feed' | 'Ad Carousel' | 'Under Description';

export interface SponsoredAd {
    id: string;
    advertiser: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    status: 'active' | 'paused';
}

export interface AdSlotAnalytics {
    id: string; // Composite key: placement-adId-timestamp or similar
    placement: AdPlacement;
    sponsoredAdId: string;
    organicAdId?: string; // ID of the organic ad it was placed in/on
    impressions: number;
    clicks: number;
}
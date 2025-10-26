import type { SponsoredAd, AdSlotAnalytics, AdPlacement } from '../types';
import { SPONSORED_ADS_KEY, AD_ANALYTICS_KEY, simulateDelay } from './mockData';

const getAllSponsoredAdsForAdmin = async (): Promise<SponsoredAd[]> => {
    await simulateDelay(100);
    const adsJson = localStorage.getItem(SPONSORED_ADS_KEY);
    return adsJson ? JSON.parse(adsJson) : [];
}

export const getSponsoredAds = async (): Promise<SponsoredAd[]> => {
    const allAds = await getAllSponsoredAdsForAdmin();
    return allAds.filter(ad => ad.status === 'active');
};

export const getAdSlotAnalytics = async (): Promise<AdSlotAnalytics[]> => {
    await simulateDelay(50);
    const analyticsJson = localStorage.getItem(AD_ANALYTICS_KEY);
    const analytics = analyticsJson ? JSON.parse(analyticsJson) : [];
    return analytics.sort((a: AdSlotAnalytics, b: AdSlotAnalytics) => b.impressions - a.impressions);
};

const findOrCreateSlot = (
    analytics: AdSlotAnalytics[],
    sponsoredAdId: string,
    placement: AdPlacement,
    organicAdId?: string
): { slot: AdSlotAnalytics, isNew: boolean } => {
    // A more robust ID would be needed in production, but this is fine for a mock.
    const slotId = `${placement}-${sponsoredAdId}-${organicAdId || 'feed'}`;
    let slot = analytics.find(s => s.id === slotId);
    let isNew = false;
    if (!slot) {
        isNew = true;
        slot = {
            id: slotId,
            placement,
            sponsoredAdId,
            organicAdId,
            impressions: 0,
            clicks: 0,
        };
    }
    return { slot, isNew };
};

export const trackImpression = async (sponsoredAdId: string, placement: AdPlacement, organicAdId?: string): Promise<void> => {
    await simulateDelay(20); // Tracking should be fast
    const analytics = await getAdSlotAnalytics();
    const { slot, isNew } = findOrCreateSlot(analytics, sponsoredAdId, placement, organicAdId);
    
    slot.impressions += 1;
    
    let updatedAnalytics = analytics;
    if (isNew) {
        updatedAnalytics.push(slot);
    } else {
        updatedAnalytics = analytics.map(s => s.id === slot.id ? slot : s);
    }
    
    localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify(updatedAnalytics));
};

export const trackClick = async (sponsoredAdId: string, placement: AdPlacement, organicAdId?: string): Promise<void> => {
    await simulateDelay(20);
    const analytics = await getAdSlotAnalytics();
    const { slot, isNew } = findOrCreateSlot(analytics, sponsoredAdId, placement, organicAdId);

    slot.clicks += 1;
    
    let updatedAnalytics = analytics;
    if (isNew) {
        updatedAnalytics.push(slot);
    } else {
        updatedAnalytics = analytics.map(s => s.id === slot.id ? slot : s);
    }

    localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify(updatedAnalytics));
};


// --- ADMIN CRUD FOR SPONSORED ADS ---

export const getAdvertisingDashboardData = async (): Promise<{ ads: SponsoredAd[], analytics: AdSlotAnalytics[] }> => {
    await simulateDelay(500);
    const [ads, analytics] = await Promise.all([
        getAllSponsoredAdsForAdmin(),
        getAdSlotAnalytics()
    ]);
    return { ads, analytics };
};


export const updateSponsoredAd = async (adId: string, updates: Partial<Omit<SponsoredAd, 'id'>>): Promise<SponsoredAd> => {
    await simulateDelay(300);
    const ads = await getAllSponsoredAdsForAdmin();
    const adIndex = ads.findIndex(ad => ad.id === adId);
    if (adIndex === -1) {
        throw new Error("Sponsored ad not found.");
    }
    const updatedAd = { ...ads[adIndex], ...updates };
    ads[adIndex] = updatedAd;
    localStorage.setItem(SPONSORED_ADS_KEY, JSON.stringify(ads));
    return updatedAd;
};

export const createSponsoredAd = async (data: Omit<SponsoredAd, 'id' | 'status'>): Promise<SponsoredAd> => {
    await simulateDelay(400);
    const ads = await getAllSponsoredAdsForAdmin();
    const newAd: SponsoredAd = {
        ...data,
        id: `sp-${Date.now()}`,
        status: 'paused', // New ads start as paused
    };
    ads.push(newAd);
    localStorage.setItem(SPONSORED_ADS_KEY, JSON.stringify(ads));
    return newAd;
};

export const deleteSponsoredAd = async (adId: string): Promise<void> => {
    await simulateDelay(300);
    let ads = await getAllSponsoredAdsForAdmin();
    ads = ads.filter(ad => ad.id !== adId);
    localStorage.setItem(SPONSORED_ADS_KEY, JSON.stringify(ads));
};

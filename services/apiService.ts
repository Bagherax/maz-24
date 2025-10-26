/**
 * MAZDADY API Service (Legacy Path)
 * 
 * NOTE: This is a MOCK API service for frontend development.
 * It simulates the behavior of the MAZDADY backend as described in the architecture.
 * 
 * --- MAZDADY Central Server Architecture (Minimal & Stateless) ---
 * 
 * The central server is NOT a data repository. Its sole purpose is to facilitate
 * user-owned data interactions. It consists of several stateless services:
 * 
 * 1.  Discovery Index (Redis/Elasticsearch with TTL)
 * 2.  Auth & Identity (OAuth2 / Passkey)
 * 3.  AI Gateway (FastAPI)
 * 4.  Notification Relay (WebSocket / Redis Pub/Sub)
 * 
 * --- AI Ad Creation from Image ---
 * 
 * 1.  Image-First Workflow: The user starts by uploading a product image.
 * 2.  Multi-Modal Analysis: A Gemini Vision model analyzes the image to perform:
 *     - Product Recognition: Identifies the item.
 *     - Specification Extraction: Determines brand, model, condition.
 *     - Smart Pricing: Suggests a market-based price by comparing to a database of similar listings.
 *     - Content Generation: Writes an SEO-optimized title and description.
 * 3.  Automated Image Enhancement: The service can also return an enhanced version of the
 *     image with background removal and improved lighting.
 * 4.  User Review: The generated content pre-fills the ad creation form, allowing the
 *     user to review, edit, and finalize the listing.
 * 
 * --- Advanced Auction System ---
 * 
 * 1.  Customizable Auction Types: Sellers can choose the auction format that best
 *     suits their item, increasing engagement and final sale value.
 *     - English Auction: Traditional format where bids increase the price.
 *     - Dutch Auction: Price starts high and decreases over time until a buyer accepts.
 *     - Sealed-Bid Auction: All bids are private; the highest bidder wins at the end.
 * 
 * 2.  AI-Powered Strategy: The AI Gateway can suggest optimal auction parameters
 *     (start price, duration, timing) based on the item and market activity,
 *     helping sellers maximize their returns.
 * 
 * 3.  Blockchain-Free Security: Auction integrity is maintained without the complexity
 *     of blockchain. Each bid is digitally signed by the bidder's private key and
 *     logged. At the auction's conclusion, all signed bids are verified, ensuring
 *     a transparent and tamper-proof process.
 * 
 * --- Security & Privacy (End-to-End Ownership) ---
 * 
 * 1.  User-Signed Data: All ad links and auction bids are simulated as being
 *     digitally signed by the user's private key. This ensures authenticity and
 *     prevents tampering.
 * 
 * 2.  Data Sovereignty: No third party, including the MAZ central server, can
 *     modify or delete ad data from a user's personal cloud. The user holds
 *     the master keys.
 * 
 * 3.  Ephemeral, Secure Links: Shared ad links are temporary and secure.
 * 
 * --- Scalability Strategy ---
 * 
 * 1.  Discovery Index (High User Load): TTL-based index ensures the server remains stateless.
 * 2.  AI Request Queuing (High AI Load): Intensive tasks are handled by a message queue.
 * 3.  Network Resilience (Connection Failure): Graceful degradation to a local-only mode.
 * 
 * --- Core UX Flow ---
 * 
 * 1.  Create Ad: User creates an ad (Buy Now or Auction), saved as a 'local' draft.
 * 2.  Choose Action: User can "Publish Temporarily" ('public') or "Sync to Cloud" ('synced').
 * 3.  Discovery: Other users see 'public' and 'synced' ads/auctions.
 * 4.  Interaction: Chat messages are E2E encrypted. Bids are digitally signed.
 * 
 * This mock service simulates these interactions using localStorage.
 */

import type { User, Ad, AdSyncStatus, ListingType, AuctionType, AuctionDetails } from '../types';

// --- CONSTANTS ---
const JWT_KEY = 'mazdady_jwt';
const USER_ADS_PREFIX = 'mazdady_user_ads_';
const NETWORK_STATUS_KEY = 'mazdady_network_status';

// --- MOCK USER DATABASE ---
const MOCK_USERS: User[] = [
    { id: 'user-1', username: 'mazdady_admin', email: 'admin@mazdady.com', tier: 'MAZ', isVerified: true, avatarUrl: 'https://picsum.photos/seed/admin/200' },
    { id: 'user-2', username: 'seller_pro', email: 'pro@seller.com', tier: 'gold', isVerified: true, avatarUrl: 'https://picsum.photos/seed/pro/200' }
];

// --- MOCK LOCAL STORAGE / ON-DEVICE DATABASE ---
// FIX: Updated mock ads to use 'media' and added missing properties to match the 'Ad' type.
const getInitialMockAds = (): Ad[] => [
    // Synced Ads (Always Visible)
    // FIX: Added missing 'condition' property to satisfy the 'Ad' type.
    // FIX: Replaced 'imageUrls' with 'media' to match the 'Ad' type.
    { id: 'ad-1', publicId: 'uuid-ad-1', title: 'Vintage Leather Jacket', description: 'A stylish vintage jacket.', price: 150, seller: MOCK_USERS[1], media: [{ type: 'image', url: 'https://picsum.photos/seed/jacket/400/300' }], location: 'Riyadh', rating: 4.5, reviews: 120, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), listingType: 'buy-now', syncStatus: 'synced', version: 1, boostScore: 10, condition: 'used' },
    // FIX: Added missing 'condition' property to satisfy the 'Ad' type.
    // FIX: Replaced 'imageUrls' with 'media' to match the 'Ad' type.
    { id: 'ad-2', publicId: 'uuid-ad-2', title: 'Rare Comic Book (Sealed Auction)', description: 'First edition, mint condition.', price: 500, seller: MOCK_USERS[0], media: [{ type: 'image', url: 'https://picsum.photos/seed/comic/400/300' }], location: 'Jeddah', rating: 4.9, reviews: 34, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), listingType: 'auction', syncStatus: 'synced', auctionType: 'sealed', auctionDetails: { startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000 * 2).toISOString(), startPrice: 500, bids: [] }, version: 1, boostScore: 25, condition: 'new' },
    
    // Public Ads (Visible when user is online)
    // FIX: Added missing 'condition' property to satisfy the 'Ad' type.
    // FIX: Replaced 'imageUrls' with 'media' to match the 'Ad' type.
    { id: 'ad-3', publicId: 'uuid-ad-3', title: 'Acoustic Guitar', description: 'Great for beginners.', price: 120, seller: MOCK_USERS[1], media: [{ type: 'image', url: 'https://picsum.photos/seed/guitar/400/300' }], location: 'Dammam', rating: 4.2, reviews: 5, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), listingType: 'buy-now', syncStatus: 'public', version: 1, boostScore: 5, condition: 'used' },
    // FIX: Added missing 'condition' property to satisfy the 'Ad' type.
    // FIX: Replaced 'imageUrls' with 'media' to match the 'Ad' type.
    { id: 'ad-4', publicId: 'uuid-ad-4', title: 'Retro Console (Dutch Auction)', description: 'Classic games included. Price drops every hour!', price: 300, seller: MOCK_USERS[0], media: [{ type: 'image', url: 'https://picsum.photos/seed/console/400/300' }], location: 'Riyadh', rating: 4.8, reviews: 78, createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), listingType: 'auction', syncStatus: 'public', auctionType: 'dutch', auctionDetails: { startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), startPrice: 350, currentPrice: 300, bids: [] }, version: 1, boostScore: 0, condition: 'refurbished' },
    
    // Local Ad (Only visible to owner)
    // FIX: Added missing 'condition' property to satisfy the 'Ad' type.
    // FIX: Replaced 'imageUrls' with 'media' to match the 'Ad' type.
    { id: 'ad-5', publicId: 'uuid-ad-5', title: 'Handmade Ceramic Mug (English Auction)', description: 'Perfect for your morning coffee.', price: 25, seller: MOCK_USERS[1], media: [{ type: 'image', url: 'https://picsum.photos/seed/mug/400/300' }], location: 'Jeddah', rating: 5.0, reviews: 1, createdAt: new Date().toISOString(), listingType: 'auction', syncStatus: 'local', auctionType: 'english', auctionDetails: { startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000 * 3).toISOString(), startPrice: 25, bids: [{userId: 'user-1', username: 'mazdady_admin', amount: 28, timestamp: new Date().toISOString(), signature: 'mock_sig'}] }, version: 1, boostScore: 0, condition: 'new' },
];

const initializeMockData = () => {
    const allAds = getInitialMockAds();
    const adminAds = allAds.filter(ad => ad.seller.id === MOCK_USERS[0].id);
    const sellerAds = allAds.filter(ad => ad.seller.id === MOCK_USERS[1].id);

    const adminAdsKey = `${USER_ADS_PREFIX}${MOCK_USERS[0].id}`;
    if (!localStorage.getItem(adminAdsKey)) {
        localStorage.setItem(adminAdsKey, JSON.stringify(adminAds));
    }
     const sellerAdsKey = `${USER_ADS_PREFIX}${MOCK_USERS[1].id}`;
    if (!localStorage.getItem(sellerAdsKey)) {
        localStorage.setItem(sellerAdsKey, JSON.stringify(sellerAds));
    }
};
initializeMockData();


const getUserLocalAds = (userId: string): Ad[] => {
    const adsJson = localStorage.getItem(`${USER_ADS_PREFIX}${userId}`);
    return adsJson ? JSON.parse(adsJson) : [];
};

const setUserLocalAds = (userId: string, ads: Ad[]) => {
    localStorage.setItem(`${USER_ADS_PREFIX}${userId}`, JSON.stringify(ads));
};


// --- AUTH LISTENER ---
let authListeners: ((user: User | null) => void)[] = [];

const notifyAuthChange = (user: User | null) => {
    authListeners.forEach(listener => listener(user));
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
    authListeners.push(callback);
    // Immediately call with current state
    getCurrentUser().then(user => callback(user));
    return () => {
        authListeners = authListeners.filter(listener => listener !== callback);
    };
};


// --- MOCK API FUNCTIONS ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Belongs to: User & Auth Service
export const login = async (email: string, password_unused: string): Promise<User> => {
    await simulateDelay(500);
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
        localStorage.setItem(JWT_KEY, JSON.stringify(user));
        notifyAuthChange(user);
        return user;
    }
    throw new Error('Invalid credentials');
};

// Belongs to: User & Auth Service
export const register = async (username: string, email: string, password_unused: string): Promise<User> => {
    await simulateDelay(500);
    if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Email already in use');
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        tier: 'normal',
        isVerified: false,
        avatarUrl: `https://picsum.photos/seed/${username}/200`
    };
    MOCK_USERS.push(newUser);
    localStorage.setItem(JWT_KEY, JSON.stringify(newUser));
    notifyAuthChange(newUser);
    return newUser;
};

// Belongs to: User & Auth Service
export const logout = async (): Promise<void> => {
    await simulateDelay(200);
    localStorage.removeItem(JWT_KEY);
    notifyAuthChange(null);
};

// Belongs to: User & Auth Service
export const getCurrentUser = async (): Promise<User | null> => {
    await simulateDelay(100);
    const token = localStorage.getItem(JWT_KEY);
    if (token) {
        try {
            return JSON.parse(token) as User;
        } catch (e) {
            return null;
        }
    }
    return null;
};

/**
 * Gets ads for the public marketplace.
 * Simulates a central discovery server that only knows about ads that
 * users have explicitly made 'public' or 'synced'.
 * It respects the simulated network status of the current user.
 */
export const getAds = async (): Promise<Ad[]> => {
    await simulateDelay(800);
    const currentUser = await getCurrentUser();
    const isCurrentUserOnline = localStorage.getItem(NETWORK_STATUS_KEY) !== 'offline';

    let allDiscoverableAds: Ad[] = [];

    // In this mock, iterate through all known users to build the discovery index
    MOCK_USERS.forEach(user => {
        const userAds = getUserLocalAds(user.id);
        
        // 1. Synced ads are always discoverable, as they exist on a cloud server
        allDiscoverableAds.push(...userAds.filter(ad => ad.syncStatus === 'synced'));

        // 2. Public ads are discoverable only if the user is "online"
        // This simulates the temporary registration in the Discovery Index.
        if (user.id !== currentUser?.id) {
            // For this simulation, we assume all other users are online
            allDiscoverableAds.push(...userAds.filter(ad => ad.syncStatus === 'public'));
        } else {
            // For the current user, we respect their actual simulated status
            if (isCurrentUserOnline) {
                allDiscoverableAds.push(...userAds.filter(ad => ad.syncStatus === 'public'));
            }
        }
    });
    
    // Remove duplicates and sort
    const uniqueAds = Array.from(new Map(allDiscoverableAds.map(ad => [ad.publicId || ad.id, ad])).values());
    
    return uniqueAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


/**
 * Gets all ads owned by the current user, regardless of status.
 */
export const getMyAds = async (): Promise<Ad[]> => {
    await simulateDelay(400);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return [];
    }
    return getUserLocalAds(currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

interface CreateAdData {
    title: string;
    description: string;
    price: number;
    image: File;
    listingType: ListingType;
    auctionType?: AuctionType;
    auctionDetails?: Omit<AuctionDetails, 'bids'>;
}

// Belongs to: Listing Core Service
export const createAd = async (data: CreateAdData): Promise<Ad> => {
    await simulateDelay(1000);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('You must be logged in to create an ad.');
    }

    // FIX: Updated new ad object to use 'media' and added missing properties to match 'Ad' type.
    const newAd: Ad = {
        id: `local-ad-${Date.now()}`,
        publicId: `uuid-ad-${Date.now()}`,
        title: data.title,
        description: data.description,
        price: data.price,
        seller: currentUser,
        // FIX: Replaced 'imageUrls' with 'media' to match the 'Ad' type.
        media: [{ type: 'image', url: URL.createObjectURL(data.image) }], // Simulate image upload
        location: 'Unknown',
        rating: 0,
        reviews: 0,
        // FIX: Added missing 'condition' property to satisfy the 'Ad' type.
        condition: 'used',
        createdAt: new Date().toISOString(),
        listingType: data.listingType,
        syncStatus: 'local', // New ads start as local drafts
        auctionType: data.auctionType,
        auctionDetails: data.auctionDetails ? { ...data.auctionDetails, bids: [] } : undefined,
        version: 1,
        boostScore: 0,
    };
    
    const currentUserAds = getUserLocalAds(currentUser.id);
    currentUserAds.push(newAd);
    setUserLocalAds(currentUser.id, currentUserAds);
    
    return newAd;
};

// --- AD LIFECYCLE MANAGEMENT FUNCTIONS ---

const updateAdStatus = async (adId: string, newStatus: AdSyncStatus): Promise<void> => {
    await simulateDelay(300);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const userAds = getUserLocalAds(currentUser.id);
    const adIndex = userAds.findIndex(ad => ad.id === adId);

    if (adIndex === -1) throw new Error("Ad not found.");

    userAds[adIndex].syncStatus = newStatus;
    setUserLocalAds(currentUser.id, userAds);
};

export const publishAd = (adId: string) => updateAdStatus(adId, 'public');
export const unpublishAd = (adId: string) => updateAdStatus(adId, 'local');
export const syncAdToCloud = (adId: string) => updateAdStatus(adId, 'synced');
export const unsyncAdFromCloud = (adId: string) => updateAdStatus(adId, 'public'); // Reverts to public, not local


export const placeBid = async (adId: string, amount: number): Promise<void> => {
    await simulateDelay(500);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    // In a real P2P system, this would be more complex. Here we find the ad owner
    // and update their local storage, simulating a direct or relayed update.
    let adFound = false;
    for (const user of MOCK_USERS) {
        const userAds = getUserLocalAds(user.id);
        const adIndex = userAds.findIndex(ad => ad.id === adId || ad.publicId === adId);
        if (adIndex !== -1) {
            const ad = userAds[adIndex];
            if (ad.auctionDetails) {
                ad.auctionDetails.bids.push({
                    userId: currentUser.id,
                    username: currentUser.username,
                    amount,
                    timestamp: new Date().toISOString(),
                    signature: `signed_by_${currentUser.id}_at_${Date.now()}` // Mock signature
                });
                // Update price for English auctions
                if (ad.auctionType === 'english') {
                    ad.price = amount;
                }
                setUserLocalAds(user.id, userAds);
                adFound = true;
                break;
            }
        }
    }
    if (!adFound) throw new Error("Auction ad not found.");
};
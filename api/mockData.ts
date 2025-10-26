import type { User, Ad, Conversation, AdminLogEntry, AdCondition, Review, Media, SponsoredAd, AdSlotAnalytics } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { getCurrentUser } from './authService';

// --- CONSTANTS ---
export const JWT_KEY = 'mazdady_jwt';
export const USER_ADS_PREFIX = 'mazdady_user_ads_';
export const USER_CONVOS_PREFIX = 'mazdady_user_convos_';
export const USER_REVIEWS_PREFIX = 'mazdady_user_reviews_';
export const USER_SUBMITTED_REVIEWS_PREFIX = 'mazdady_user_submitted_reviews_';
export const NETWORK_STATUS_KEY = 'mazdady_network_status';
export const CLOUD_CONFIG_KEY = 'mazdady_cloud_config';
export const ADMIN_LOG_KEY = 'mazdady_admin_log';
export const SPONSORED_ADS_KEY = 'mazdady_sponsored_ads';
export const AD_ANALYTICS_KEY = 'mazdady_ad_analytics';


// --- MOCK USER DATABASE ---
export const MOCK_USERS: User[] = [
    { id: 'user-1', username: 'mazdady_admin', email: 'admin@mazdady.com', tier: 'MAZ', isVerified: true, avatarUrl: 'https://picsum.photos/seed/admin/200', profileBannerUrl: 'https://picsum.photos/seed/admin_banner/1000/300', profileBackgroundUrl: 'https://www.toptal.com/designers/subtlepatterns/uploads/double-bubble-outline.png', role: 'super_admin', averageRating: 5.0, totalReviews: 2, followingIds: [] },
    { 
        id: 'user-2', 
        username: 'seller_pro', 
        email: 'pro@seller.com', 
        tier: 'gold', 
        isVerified: true, 
        avatarUrl: 'https://picsum.photos/seed/pro/200', 
        profileBannerUrl: 'https://picsum.photos/seed/pro_banner/1000/300',
        profileBackgroundUrl: 'https://www.toptal.com/designers/subtlepatterns/uploads/webb.png',
        averageRating: 4.8, 
        totalReviews: 24, 
        followingIds: ['user-4'],
        collections: [
            { id: 'coll-1', name: 'Rare Collectibles', adIds: ['ad-flagged-1'] },
            { id: 'coll-2', name: 'Daily Drivers', adIds: [] }
        ],
        chatSettings: {
            welcomeMessage: "Hello! Thanks for your interest. I'll get back to you as soon as I can.",
            quickReplies: ["Yes, it's still available.", "Sorry, the price is firm.", "I can ship it to you.", "When would you like to pick it up?"]
        },
        learnedQA: []
    },
    { id: 'user-3', username: 'casual_seller', email: 'casual@seller.com', tier: 'bronze', isVerified: false, avatarUrl: 'https://picsum.photos/seed/casual/200', profileBannerUrl: 'https://picsum.photos/seed/casual_banner/1000/300', profileBackgroundUrl: 'https://www.toptal.com/designers/subtlepatterns/uploads/leaves.png', averageRating: 4.2, totalReviews: 3, followingIds: [] },
    { id: 'user-4', username: 'power_user', email: 'power@user.com', tier: 'diamond', isVerified: true, avatarUrl: 'https://picsum.photos/seed/power/200', profileBannerUrl: 'https://picsum.photos/seed/power_banner/1000/300', profileBackgroundUrl: 'https://www.toptal.com/designers/subtlepatterns/uploads/upholstery.png', averageRating: 4.9, totalReviews: 52, followingIds: ['user-2'] },
];

const generateMockAds = (): Ad[] => {
    const ads: Ad[] = [];
    const titles = ["Vintage Camera", "Gaming PC", "Mountain Bike", "Designer Handbag", "Electric Guitar", "Antique Vase", "Smartwatch", "Drone with 4K Camera", "Leather Sofa", "Signed Football Jersey"];
    const locations = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"];
    const conditions: AdCondition[] = ['new', 'used', 'refurbished'];
    const descriptions = [
        "In excellent condition, barely used. Comes with all original accessories and packaging.",
        "A powerful machine, perfect for gaming and professional work. Recently upgraded.",
        "Perfect for trails and city riding. Well-maintained and ready to go.",
        "A timeless piece from a famous designer. 100% authentic with proof of purchase.",
        "Classic model with amazing sound. A must-have for any musician.",
        "A beautiful piece of history. Adds elegance to any room.",
        "Latest model with all the features. Includes charger and extra straps.",
        "Capture stunning aerial footage. Easy to fly and very stable.",
        "Comfortable and stylish, made from genuine leather. Great for a living room.",
        "Signed by the legendary player. A true collector's item."
    ];
    const topLevelCategories = Object.keys(DEFAULT_CATEGORIES);

    for (let i = 1; i <= 100; i++) {
        const seller = MOCK_USERS[i % MOCK_USERS.length];
        const title = titles[i % titles.length];
        const topCategoryKey = topLevelCategories[i % topLevelCategories.length];
        
        const subCategoryKeys = Object.keys(DEFAULT_CATEGORIES[topCategoryKey as keyof typeof DEFAULT_CATEGORIES]);
        const subCategoryName = subCategoryKeys.length > 0 ? subCategoryKeys[i % subCategoryKeys.length] : null;

        const media: Media[] = [{
            type: 'image',
            url: `https://picsum.photos/seed/${i * 10}/600/400`,
        }];

        // Add a youtube video to some ads
        if (i % 10 === 0) {
            media.push({
                type: 'youtube',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            });
        }
        
        // Add more images
         if (i % 3 === 0) {
             media.push({ type: 'image', url: `https://picsum.photos/seed/${i * 10 + 1}/600/400`});
             media.push({ type: 'image', url: `https://picsum.photos/seed/${i * 10 + 2}/600/400`});
         }


        const ad: Ad = {
            id: `ad-gen-${i}`,
            publicId: `uuid-ad-gen-${i}`,
            version: 1,
            boostScore: Math.floor(Math.random() * 50),
            title: `${title} #${i}`,
            description: descriptions[i % descriptions.length],
            price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
            seller: seller,
            media: media,
            location: locations[i % locations.length],
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3.0 and 5.0
            reviews: Math.floor(Math.random() * 200),
            condition: conditions[i % conditions.length],
            viewCount: Math.floor(Math.random() * 5000),
            specs: {
                "Brand": "Genericorp",
                "Model": `Model ${i % 10}`,
                "Warranty": "None",
                "Color": "Varies"
            },
            createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
            listingType: Math.random() > 0.3 ? 'buy-now' : 'auction',
            syncStatus: 'public',
            categoryPath: subCategoryName ? [topCategoryKey, subCategoryName] : [topCategoryKey],
        };
        if (ad.listingType === 'auction') {
            ad.auctionType = 'english';
            ad.auctionDetails = {
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
                startPrice: ad.price,
                bids: []
            };
        }
        ads.push(ad);
    }
    return ads;
}


// --- MOCK LOCAL STORAGE / ON-DEVICE DATABASE ---
const getInitialMockAds = (): Ad[] => {
    const generatedAds = generateMockAds();

    // Keep some original specific ads for consistency
    const specialAds: Ad[] = [
        { id: 'ad-2', version: 1, boostScore: 0, publicId: 'uuid-ad-2', title: 'Rare Comic Book (Sealed Auction)', description: 'First edition, mint condition.', price: 500, seller: MOCK_USERS[0], media: Array.from({ length: 5 }, (_, k) => ({ type: 'image', url: `https://picsum.photos/seed/comic${k}/600/400` })), createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), listingType: 'auction', syncStatus: 'synced', auctionType: 'sealed', auctionDetails: { startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000 * 2).toISOString(), startPrice: 500, bids: [] }, cloudUrl: 'https://user-cloud.com/ads/uuid-ad-2.json?token=xyz', signature: 'jwt.mock.signature.user1', location: "Dammam", rating: 4.9, reviews: 45, condition: 'new', viewCount: 12345, categoryPath: ["Hobbies, Sports & Leisure", "Collectibles"] },
        { id: 'ad-flagged-1', version: 1, boostScore: 0, publicId: 'uuid-ad-flagged-1', title: 'Suspiciously Cheap Smart Watch', description: 'Brand new smart watch, latest model, huge discount.', price: 25, seller: MOCK_USERS[1], media: [{type: 'image', url: 'https://picsum.photos/seed/watch/600/400'}], createdAt: new Date().toISOString(), listingType: 'buy-now', syncStatus: 'public', isFlagged: true, reportReason: 'Potential Scam / Counterfeit Item', location: "Jeddah", rating: 2.1, reviews: 112, condition: 'new', viewCount: 987, categoryPath: ["Electronics & Technology", "Wearable Technology"] },
    ];

    // Ensure special ads are not duplicated by generated ones
    const generatedIds = new Set(specialAds.map(ad => ad.id));
    const filteredGenerated = generatedAds.filter(ad => !generatedIds.has(ad.id));

    return [...specialAds, ...filteredGenerated];
};

const getInitialMockReviews = (): { [sellerId: string]: Review[] } => ({
    'user-2': [
        { id: 'rev-1', adId: 'ad-gen-2', sellerId: 'user-2', reviewer: MOCK_USERS[3], rating: 5, comment: 'Great seller, fast communication and the item was exactly as described. Highly recommended!', timestamp: new Date(Date.now() - 86400000).toISOString(), signature: 'mock_sig_rev1' },
        { id: 'rev-2', adId: 'ad-gen-6', sellerId: 'user-2', reviewer: MOCK_USERS[0], rating: 4, comment: 'Smooth transaction. The product was in excellent condition.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), signature: 'mock_sig_rev2' }
    ],
    'user-3': [
        { id: 'rev-3', adId: 'ad-gen-3', sellerId: 'user-3', reviewer: MOCK_USERS[1], rating: 4, comment: 'Item as described, but shipping was a bit slow.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), signature: 'mock_sig_rev3' }
    ]
});

const getInitialAdminLog = (): AdminLogEntry[] => [
    {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        adminId: 'user-1',
        adminUsername: 'mazdady_admin',
        action: 'DISMISSED_REPORT',
        targetId: 'uuid-ad-previous',
        reason: 'False positive flag by user.'
    }
];

const MOCK_SPONSORED_ADS: SponsoredAd[] = [
    { id: 'sp-1', advertiser: 'Techtronics Inc.', title: '50% off All Headphones', imageUrl: 'https://picsum.photos/seed/ad1/600/400', linkUrl: '#', status: 'active' },
    { id: 'sp-2', advertiser: 'Fashion Forward', title: 'New Summer Collection Arrived', imageUrl: 'https://picsum.photos/seed/ad2/600/400', linkUrl: '#', status: 'active' },
    { id: 'sp-3', advertiser: 'Home Goods Deluxe', title: 'Upgrade Your Living Room Today!', imageUrl: 'https://picsum.photos/seed/ad3/600/400', linkUrl: '#', status: 'paused' },
];

export const initializeMockData = () => {
    const allAds = getInitialMockAds();
    
    MOCK_USERS.forEach(user => {
        const userAds = allAds.filter(ad => ad.seller.id === user.id);
        const userAdsKey = `${USER_ADS_PREFIX}${user.id}`;
        // Only initialize if it doesn't exist, to preserve user-created data.
        if (!localStorage.getItem(userAdsKey)) {
            setUserLocalData<Ad>(USER_ADS_PREFIX, user.id, userAds);
        }
    });

    const allReviews = getInitialMockReviews();
    Object.entries(allReviews).forEach(([sellerId, reviews]) => {
        const userReviewsKey = `${USER_REVIEWS_PREFIX}${sellerId}`;
        if (!localStorage.getItem(userReviewsKey)) {
            setUserLocalData<Review>(USER_REVIEWS_PREFIX, sellerId, reviews);
        }
    });

    if (!localStorage.getItem(ADMIN_LOG_KEY)) {
      localStorage.setItem(ADMIN_LOG_KEY, JSON.stringify(getInitialAdminLog()));
    }

    if (!localStorage.getItem(SPONSORED_ADS_KEY)) {
        localStorage.setItem(SPONSORED_ADS_KEY, JSON.stringify(MOCK_SPONSORED_ADS));
    }
    
    if (!localStorage.getItem(AD_ANALYTICS_KEY)) {
        localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify([]));
    }
};

// --- HELPERS ---
export const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Simulates encrypted storage by Base64 encoding the JSON string.
export const getUserLocalData = <T>(prefix: string, userId: string): T[] => {
    const base64Json = localStorage.getItem(`${prefix}${userId}`);
    if (!base64Json) return [];
    try {
        return JSON.parse(atob(base64Json));
    } catch (e) {
        console.error(`Failed to decode/parse data for key: ${prefix}${userId}`, e);
        // Fallback for potentially un-encoded data during development
        try {
            return JSON.parse(base64Json);
        } catch (e2) {
            return [];
        }
    }
};

export const setUserLocalData = <T>(prefix: string, userId: string, data: T[]) => {
    localStorage.setItem(`${prefix}${userId}`, btoa(JSON.stringify(data)));
};

export const getAndSaveUser = async (updateFn: (user: User) => User): Promise<User> => {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const updatedUser = updateFn(currentUser);

    const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
    }
    localStorage.setItem(JWT_KEY, JSON.stringify(updatedUser));

    return updatedUser;
};

export const getUserLocalAds = (userId: string): Ad[] => getUserLocalData<Ad>(USER_ADS_PREFIX, userId);
export const setUserLocalAds = (userId: string, ads: Ad[]) => setUserLocalData<Ad>(USER_ADS_PREFIX, userId, ads);
export const getUserLocalConvos = (userId: string): Conversation[] => getUserLocalData<Conversation>(USER_CONVOS_PREFIX, userId);
export const setUserLocalConvos = (userId: string, convos: Conversation[]) => setUserLocalData<Conversation>(USER_CONVOS_PREFIX, userId, convos);
export const getUserLocalReviews = (userId: string): Review[] => getUserLocalData<Review>(USER_REVIEWS_PREFIX, userId);
export const setUserLocalReviews = (userId: string, reviews: Review[]) => setUserLocalData<Review>(USER_REVIEWS_PREFIX, userId, reviews);


initializeMockData();

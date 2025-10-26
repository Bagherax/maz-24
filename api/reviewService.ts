import type { Review, User } from '../types';
import { simulateDelay, getUserLocalReviews, MOCK_USERS, setUserLocalData, USER_REVIEWS_PREFIX, USER_SUBMITTED_REVIEWS_PREFIX, getUserLocalData } from './mockData';
import { getCurrentUser } from './authService';

/**
 * Fetches all reviews for a specific seller.
 * @param sellerId The ID of the seller whose reviews are to be fetched.
 * @returns A promise that resolves to an array of reviews.
 */
export const getReviewsForSeller = async (sellerId: string): Promise<Review[]> => {
    await simulateDelay(600);
    // In a real P2P system, this might fetch from a distributed hash table
    // or the seller's public review manifest. Here, we read from the seller's
    // local storage space, simulating access to their public data.
    const reviews = getUserLocalReviews(sellerId);
    reviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return reviews;
};

interface SubmitReviewData {
    sellerId: string;
    adId: string;
    rating: number;
    comment: string;
}

/**
 * Submits a new review for a seller.
 * The review is cryptographically signed by the reviewer and stored in the
 * seller's public review space, with a copy kept by the reviewer.
 * @param data The review data to be submitted.
 * @returns A promise that resolves to the newly created review.
 */
export const submitReview = async (data: SubmitReviewData): Promise<Review> => {
    await simulateDelay(800);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error("You must be logged in to leave a review.");
    }
    if (currentUser.id === data.sellerId) {
        throw new Error("You cannot review yourself.");
    }

    const newReview: Review = {
        id: `rev-${Date.now()}`,
        adId: data.adId,
        sellerId: data.sellerId,
        reviewer: currentUser,
        rating: data.rating,
        comment: data.comment,
        timestamp: new Date().toISOString(),
        signature: `signed_by_${currentUser.id}_at_${Date.now()}`, // Mock signature
    };

    // P2P Simulation: The review is sent to the seller to be added to their public, user-managed review list.
    const sellerReviews = getUserLocalReviews(data.sellerId);
    
    // Prevent duplicate reviews for the same ad from the same user
    const existingReview = sellerReviews.find(r => r.adId === data.adId && r.reviewer.id === currentUser.id);
    if (existingReview) {
        throw new Error("You have already submitted a review for this transaction.");
    }
    
    sellerReviews.push(newReview);
    setUserLocalData<Review>(USER_REVIEWS_PREFIX, data.sellerId, sellerReviews);
    
    // Also save a copy on the reviewer's device as a personal record of reviews they've submitted.
    const submittedReviews = getUserLocalData<Review>(USER_SUBMITTED_REVIEWS_PREFIX, currentUser.id);
    submittedReviews.push(newReview);
    setUserLocalData<Review>(USER_SUBMITTED_REVIEWS_PREFIX, currentUser.id, submittedReviews);


    // A real backend/P2P system would now trigger a recalculation of the seller's aggregate rating.
    // Here we simulate that for the mock data object.
    const seller = MOCK_USERS.find(u => u.id === data.sellerId);
    if (seller) {
        const totalReviews = seller.totalReviews ? seller.totalReviews + 1 : 1;
        const currentTotalRating = (seller.averageRating || 0) * (seller.totalReviews || 0);
        const newAverageRating = (currentTotalRating + newReview.rating) / totalReviews;
        seller.totalReviews = totalReviews;
        seller.averageRating = newAverageRating;
    }
    
    return newReview;
};

import React, { useState, useEffect } from 'react';
import type { User, Review } from '../../types';
import * as api from '../../api';
import { StarRatingDisplay } from '../../components/ui/StarRatingDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface SellerReviewsProps {
  seller: User;
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="bg-primary p-3 rounded-lg border border-border-color">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img src={review.reviewer.avatarUrl} alt={review.reviewer.username} className="w-8 h-8 rounded-full" />
        <span className="ml-2 font-semibold text-sm text-text-primary">{review.reviewer.username}</span>
      </div>
      <StarRatingDisplay rating={review.rating} />
    </div>
    <p className="text-sm text-text-secondary mt-2">{review.comment}</p>
    <p className="text-xs text-text-secondary/70 text-right mt-2">{new Date(review.timestamp).toLocaleDateString()}</p>
  </div>
);

const SellerReviews: React.FC<SellerReviewsProps> = ({ seller }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedReviews = await api.getReviewsForSeller(seller.id);
        setReviews(fetchedReviews);
      } catch (err) {
        setError("Could not load reviews.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [seller.id]);

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-text-secondary text-center py-4">This seller has no reviews yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-semibold text-text-primary">Community Reviews ({reviews.length})</h4>
        {reviews.length > 2 && (
            <button className="text-sm font-semibold text-accent">See All</button>
        )}
      </div>
      {reviews.slice(0, 2).map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default SellerReviews;

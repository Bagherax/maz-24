import React from 'react';
import { StarIcon } from '../../components/icons/StarIcon';

const ReviewCard: React.FC<{ review: any }> = ({ review }) => (
  <div className="bg-primary p-3 rounded-lg border border-border-color">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img src={review.avatar} alt={review.name} className="w-8 h-8 rounded-full" />
        <span className="ml-2 font-semibold text-sm text-text-primary">{review.name}</span>
      </div>
      <div className="flex items-center text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>
    </div>
    <p className="text-sm text-text-secondary mt-2">{review.comment}</p>
  </div>
);

const ReviewsPlaceholder: React.FC = () => {
  const dummyReviews = [
    { name: 'Ali K.', avatar: 'https://picsum.photos/seed/ali/50', comment: 'Great seller, fast communication and the item was exactly as described. Highly recommended!' },
    { name: 'Fatima S.', avatar: 'https://picsum.photos/seed/fatima/50', comment: 'Smooth transaction. The product was in excellent condition.' },
  ];

  return (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
             <h4 className="text-base font-semibold text-text-primary">Community Reviews (2)</h4>
             <button className="text-sm font-semibold text-accent">See All</button>
        </div>
      {dummyReviews.map((review, index) => (
        <ReviewCard key={index} review={review} />
      ))}
    </div>
  );
};

export default ReviewsPlaceholder;

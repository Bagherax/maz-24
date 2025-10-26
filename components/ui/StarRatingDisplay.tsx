import React from 'react';
import { StarIcon } from '../icons/StarIcon';

interface StarRatingDisplayProps {
    rating: number;
    maxRating?: number;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, maxRating = 5 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0; // For future implementation of half stars
    const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-400" />
            ))}
            {/* Note: Half-star implementation would require a different icon or clipping */}
            {[...Array(emptyStars)].map((_, i) => (
                <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
            ))}
        </div>
    );
};

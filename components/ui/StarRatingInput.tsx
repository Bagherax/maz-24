import React from 'react';
import { StarIcon } from '../icons/StarIcon';

interface StarRatingInputProps {
    rating: number;
    setRating: (rating: number) => void;
    maxRating?: number;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, setRating, maxRating = 5 }) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    return (
        <div 
            className="flex items-center justify-center space-x-1 my-2"
            onMouseLeave={() => setHoverRating(0)}
        >
            {[...Array(maxRating)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        aria-label={`Rate ${ratingValue} out of ${maxRating}`}
                        className={`text-3xl transition-transform duration-150 transform hover:scale-125 ${ratingValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                    >
                        <StarIcon className="h-8 w-8" />
                    </button>
                );
            })}
        </div>
    );
};

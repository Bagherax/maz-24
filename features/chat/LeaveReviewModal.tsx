import React, { useState } from 'react';
import type { User } from '../../types';
import Modal from '../../components/ui/Modal';
import { StarRatingInput } from '../../components/ui/StarRatingInput';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';

interface LeaveReviewModalProps {
    adId: string;
    seller: User;
    onClose: () => void;
}

const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({ adId, seller, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a rating.");
            return;
        }
        setError(null);
        setLoading(true);

        try {
            await api.submitReview({
                sellerId: seller.id,
                adId,
                rating,
                comment,
            });
            addNotification('Your review has been submitted!', 'success');
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to submit review.";
            setError(message);
            addNotification(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal onClose={onClose} title={`Review your transaction with ${seller.username}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary text-center">Your overall rating</label>
                    <StarRatingInput rating={rating} setRating={setRating} />
                </div>
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-text-secondary">Add a written review (optional)</label>
                    <textarea 
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Describe your experience..."
                        className="mt-1 block w-full bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent"
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                 <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default LeaveReviewModal;

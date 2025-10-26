import React, { useState } from 'react';
import type { Ad } from '../../types';
import Modal from '../../components/ui/Modal';
import { useNotification } from '../../hooks/useNotification';
import * as api from '../../api';

interface EditAdModalProps {
  ad: Ad;
  onClose: () => void;
  onSave: () => void;
}

const EditAdModal: React.FC<EditAdModalProps> = ({ ad, onClose, onSave }) => {
  const [title, setTitle] = useState(ad.title);
  const [description, setDescription] = useState(ad.description);
  const [price, setPrice] = useState(ad.price.toString());
  const [loading, setLoading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step 1: Moderate content
    setModerating(true);
    try {
        const moderationResult = await api.moderateAdContent({ title, description });
        if (!moderationResult.isSafe) {
            setError(moderationResult.reason || 'Content violates community guidelines.');
            addNotification(moderationResult.reason || 'Content violates guidelines.', 'error');
            setModerating(false);
            return;
        }
    } catch (err) {
        setError('Failed to moderate content. Please try again.');
        setModerating(false);
        return;
    }
    setModerating(false);

    // Step 2: Update Ad
    setLoading(true);
    const updatedAd: Ad = {
        ...ad,
        title,
        description,
        price: parseFloat(price),
    };

    try {
        const result = await api.updateAd(updatedAd);
        if (result.conflictResolved) {
             addNotification('A conflict was detected and automatically resolved.', 'info');
        } else {
            addNotification('Ad updated successfully!', 'success');
        }
        onSave();
        onClose();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update ad.';
        setError(message);
        addNotification(message, 'error');
    } finally {
        setLoading(false);
    }
  };

  const getButtonText = () => {
      if (moderating) return 'Moderating...';
      if (loading) return 'Saving...';
      return 'Save Changes';
  }

  return (
    <Modal onClose={onClose} title="Edit Ad">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
          <textarea id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent" />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-text-secondary">Price</label>
          <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-border-color rounded-md text-sm font-medium text-text-primary bg-secondary hover:bg-border-color">
            Cancel
          </button>
          <button type="submit" disabled={loading || moderating} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover disabled:opacity-50">
            {getButtonText()}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAdModal;

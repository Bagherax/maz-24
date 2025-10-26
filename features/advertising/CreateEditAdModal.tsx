import React, { useState } from 'react';
import type { SponsoredAd } from '../../types';
import Modal from '../../components/ui/Modal';
import { useNotification } from '../../hooks/useNotification';
import * as api from '../../api';

interface CreateEditAdModalProps {
    ad: SponsoredAd | null;
    onClose: () => void;
    onSave: () => void;
}

const CreateEditAdModal: React.FC<CreateEditAdModalProps> = ({ ad, onClose, onSave }) => {
    const [title, setTitle] = useState(ad?.title || '');
    const [advertiser, setAdvertiser] = useState(ad?.advertiser || '');
    const [imageUrl, setImageUrl] = useState(ad?.imageUrl || '');
    const [linkUrl, setLinkUrl] = useState(ad?.linkUrl || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotification();

    const isEditing = !!ad;
    const modalTitle = isEditing ? 'Edit Sponsored Ad' : 'Create New Sponsored Ad';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const adData = { title, advertiser, imageUrl, linkUrl };

        try {
            if (isEditing) {
                await api.updateSponsoredAd(ad.id, adData);
                addNotification('Campaign updated successfully!', 'success');
            } else {
                await api.createSponsoredAd(adData);
                addNotification('New campaign created as paused. Resume it from the dashboard.', 'success');
            }
            onSave();
        } catch (err) {
            const message = err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} ad.`;
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal onClose={onClose} title={modalTitle}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Ad Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-accent" />
                </div>
                <div>
                    <label htmlFor="advertiser" className="block text-sm font-medium text-text-secondary">Advertiser Name</label>
                    <input type="text" id="advertiser" value={advertiser} onChange={e => setAdvertiser(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-accent" />
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary">Image URL</label>
                    <input type="url" id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-accent" />
                </div>
                <div>
                    <label htmlFor="linkUrl" className="block text-sm font-medium text-text-secondary">Target Link URL</label>
                    <input type="url" id="linkUrl" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-accent" />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-border-color rounded-md text-sm font-medium text-text-primary bg-secondary hover:bg-border-color">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Campaign'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateEditAdModal;

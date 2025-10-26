import React, { useState } from 'react';
import type { User } from '../../types';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import * as api from '../../api';

interface MoveAdModalProps {
  adId: string;
  currentCollectionId: string | null;
  onClose: () => void;
  onSave: () => void;
}

const MoveAdModal: React.FC<MoveAdModalProps> = ({ adId, currentCollectionId, onClose, onSave }) => {
    const { identity, updateCurrentUser } = useAuth();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const collections = (identity as User)?.collections || [];
    
    const handleMove = async (toCollectionId: string | null) => {
        if (toCollectionId === currentCollectionId) {
            onClose();
            return;
        }
        setLoading(true);
        try {
            const updatedUser = await api.moveAdToCollection(adId, toCollectionId);
            updateCurrentUser(updatedUser);
            addNotification("Ad moved successfully!", 'success');
            onSave();
        } catch(err) {
            addNotification(err instanceof Error ? err.message : 'Failed to move ad.', 'error');
            setLoading(false);
        }
    }

    return (
        <Modal onClose={onClose} title="Move Ad to Collection">
            <div className="space-y-2">
                <button
                    onClick={() => handleMove(null)}
                    disabled={loading}
                    className="w-full text-left p-3 bg-primary rounded-lg border border-border-color hover:bg-border-color disabled:opacity-50"
                >
                    Uncategorized
                </button>
                {collections.map(collection => (
                    <button
                        key={collection.id}
                        onClick={() => handleMove(collection.id)}
                        disabled={loading}
                        className="w-full text-left p-3 bg-primary rounded-lg border border-border-color hover:bg-border-color disabled:opacity-50"
                    >
                        {collection.name}
                    </button>
                ))}
            </div>
            {loading && <div className="text-center text-sm text-text-secondary mt-2">Moving...</div>}
        </Modal>
    );
};

export default MoveAdModal;

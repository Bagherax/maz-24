import React, { useState } from 'react';
import type { Ad } from '../../types';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';
import { useAdDetail } from '../../context/AdDetailContext';

// Modals
import EditAdModal from './EditAdModal';
import MoveAdModal from './MoveAdModal';

// Icons
import { TrashIcon } from '../../components/icons/TrashIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { EyeOffIcon } from '../../components/icons/EyeOffIcon';
import { FolderIcon } from '../../components/icons/FolderIcon';


interface MyAdCardProps {
  ad: Ad;
  currentCollectionId: string | null;
  onActionComplete: () => void;
}

const statusConfig: { [key in Ad['syncStatus']]: { text: string; color: string } } = {
    local: { text: 'Draft', color: 'bg-gray-500' },
    public: { text: 'Live', color: 'bg-blue-500' },
    synced: { text: 'Synced', color: 'bg-green-500' },
    takedown: { text: 'Removed', color: 'bg-red-600' },
};

export const MyAdCard: React.FC<MyAdCardProps> = ({ ad, currentCollectionId, onActionComplete }) => {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const { addNotification } = useNotification();
    const { openAdDetail } = useAdDetail();

    const handleApiCall = async (apiFunc: () => Promise<any>, actionName: string) => {
        setLoadingAction(actionName);
        try {
            await apiFunc();
            addNotification(`Action '${actionName}' completed successfully.`, 'success');
            onActionComplete();
        } catch (error) {
            const message = error instanceof Error ? error.message : `Could not perform '${actionName}'`;
            addNotification(message, 'error');
        } finally {
            setLoadingAction(null);
        }
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to permanently delete "${ad.title}"? This cannot be undone.`)) {
            handleApiCall(() => api.deleteAd(ad.id), 'delete');
        }
    };

    const status = statusConfig[ad.syncStatus];
    const thumbnailUrl = ad.media && ad.media.length > 0 ? (ad.media[0].thumbnailUrl || ad.media[0].url) : '';


    const ActionButton: React.FC<{onClick: (e: React.MouseEvent) => void, action: string, children: React.ReactNode, title: string, className?: string}> = ({ onClick, action, children, title, className = '' }) => (
        <button 
            title={title}
            onClick={onClick} 
            disabled={!!loadingAction}
            className={`p-2 rounded-full text-text-secondary hover:bg-border-color hover:text-text-primary transition-colors disabled:opacity-50 ${className}`}
        >
            {loadingAction === action ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div> : children}
        </button>
    );

    return (
        <>
            <div 
                onClick={() => openAdDetail(ad.id)}
                className="bg-secondary rounded-lg border border-border-color p-3 flex items-center space-x-4 cursor-pointer hover:border-accent/50 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
            >
                <img src={thumbnailUrl} alt={ad.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0 bg-primary" />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-text-primary truncate">{ad.title}</h3>
                    <p className="text-sm font-bold text-accent mt-1">${ad.price.toFixed(2)}</p>
                    <div className={`mt-2 inline-flex items-center text-xs font-medium text-white px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.text}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-1">
                    {ad.syncStatus === 'local' && (
                        <ActionButton action="publish" onClick={(e) => { e.stopPropagation(); handleApiCall(() => api.publishAd(ad.id), 'publish'); }} title="Publish Ad (Make it live on the network)">
                            <EyeIcon />
                        </ActionButton>
                    )}
                    {(ad.syncStatus === 'public' || ad.syncStatus === 'synced') && (
                        <ActionButton action="unpublish" onClick={(e) => { e.stopPropagation(); handleApiCall(() => api.unpublishAd(ad.id), 'unpublish'); }} title="Hide Ad (Revert to local draft)">
                            <EyeOffIcon />
                        </ActionButton>
                    )}
                    <ActionButton action="edit" onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }} title="Edit Ad">
                        <PencilIcon />
                    </ActionButton>
                    <ActionButton action="move" onClick={(e) => { e.stopPropagation(); setIsMoveModalOpen(true); }} title="Move to Collection">
                        <FolderIcon />
                    </ActionButton>
                     <ActionButton action="delete" onClick={(e) => { e.stopPropagation(); handleDelete(); }} title="Delete Ad" className="hover:text-red-500">
                        <TrashIcon />
                    </ActionButton>
                </div>
            </div>
            {isEditModalOpen && <EditAdModal ad={ad} onClose={() => setIsEditModalOpen(false)} onSave={() => { onActionComplete(); setIsEditModalOpen(false); }} />}
            {isMoveModalOpen && <MoveAdModal adId={ad.id} currentCollectionId={currentCollectionId} onClose={() => setIsMoveModalOpen(false)} onSave={() => { onActionComplete(); setIsMoveModalOpen(false); }} />}
        </>
    );
};
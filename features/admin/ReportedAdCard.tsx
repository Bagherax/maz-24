import React, { useState } from 'react';
import type { Ad } from '../../types';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';

interface ReportedAdCardProps {
  ad: Ad;
  onActionCompleted: () => void;
}

export const ReportedAdCard: React.FC<ReportedAdCardProps> = ({ ad, onActionCompleted }) => {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const { addNotification } = useNotification();

    const handleAction = async (action: () => Promise<void>, actionName: string) => {
        setLoadingAction(actionName);
        try {
            await action();
            addNotification(`Action '${actionName}' completed successfully.`, 'success');
            onActionCompleted();
        } catch (error) {
            addNotification(`Error: Could not perform '${actionName}'`, 'error');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleTakedown = () => {
        const reason = prompt("Please provide a reason for this takedown (will be logged):", "Violation of content policy.");
        if (reason) {
            handleAction(() => api.takedownListing(ad.id, reason), 'takedown');
        }
    };

    const handleDismiss = () => {
        handleAction(() => api.dismissReport(ad.id), 'dismiss');
    };

    const thumbnailUrl = ad.media && ad.media.length > 0 ? (ad.media[0].thumbnailUrl || ad.media[0].url) : '';

    return (
        <div className="bg-primary border border-red-800/50 rounded-lg p-3">
            <div className="flex items-start space-x-3">
                <img src={thumbnailUrl} alt={ad.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-secondary" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary">Seller: {ad.seller.username} ({ad.seller.id})</p>
                    <h4 className="font-semibold text-text-primary truncate">{ad.title}</h4>
                    <p className="text-sm text-red-400 font-semibold mt-1">Reported Reason:</p>
                    <p className="text-sm text-text-secondary">{ad.reportReason}</p>
                </div>
            </div>
            <div className="flex space-x-2 mt-3">
                <button
                    onClick={handleDismiss}
                    disabled={!!loadingAction}
                    className="w-full text-xs font-semibold px-2 py-1.5 rounded-full flex items-center justify-center transition-colors bg-secondary border border-border-color hover:bg-border-color text-text-secondary disabled:opacity-50"
                >
                    {loadingAction === 'dismiss' ? '...' : 'Dismiss Report'}
                </button>
                <button
                    onClick={handleTakedown}
                    disabled={!!loadingAction}
                    className="w-full text-xs font-semibold px-2 py-1.5 rounded-full flex items-center justify-center transition-colors bg-red-800/50 hover:bg-red-800/70 text-red-300 disabled:opacity-50"
                >
                     {loadingAction === 'takedown' ? '...' : 'Execute Takedown'}
                </button>
            </div>
        </div>
    );
};
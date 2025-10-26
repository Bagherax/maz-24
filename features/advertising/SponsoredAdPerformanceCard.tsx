import React, { useState } from 'react';
import type { SponsoredAdWithAnalytics } from './AdvertisingManagement';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';
import { PauseIcon } from '../../components/icons/PauseIcon';
import { PlayIconSolid } from '../../components/icons/PlayIconSolid';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';

interface SponsoredAdPerformanceCardProps {
    ad: SponsoredAdWithAnalytics;
    onUpdate: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const SponsoredAdPerformanceCard: React.FC<SponsoredAdPerformanceCardProps> = ({ ad, onUpdate, onEdit, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            await api.updateSponsoredAd(ad.id, { status: ad.status === 'active' ? 'paused' : 'active' });
            addNotification(`Ad campaign ${ad.status === 'active' ? 'paused' : 'resumed'}.`, 'success');
            onUpdate();
        } catch (err) {
            addNotification('Failed to update ad status.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete the campaign "${ad.title}"? This action cannot be undone.`)) {
            setLoading(true);
            try {
                await api.deleteSponsoredAd(ad.id);
                addNotification('Ad campaign deleted.', 'success');
                onDelete();
            } catch (err) {
                addNotification('Failed to delete ad.', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const totalImpressions = ad.analytics.reduce((sum, item) => sum + item.impressions, 0);
    const totalClicks = ad.analytics.reduce((sum, item) => sum + item.clicks, 0);
    const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return (
        <div className="bg-secondary rounded-lg border border-border-color p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <img src={ad.imageUrl} alt={ad.title} className="w-24 h-24 object-cover rounded-md" />
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">{ad.title}</h3>
                        <p className="text-sm text-text-secondary">{ad.advertiser}</p>
                        <div className={`mt-2 inline-flex items-center text-xs font-medium text-white px-2 py-0.5 rounded-full ${ad.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                            {ad.status === 'active' ? 'Active' : 'Paused'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleToggleStatus} disabled={loading} className="p-2 rounded-full hover:bg-primary disabled:opacity-50" title={ad.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}>
                        {ad.status === 'active' ? <PauseIcon /> : <PlayIconSolid />}
                    </button>
                     <button onClick={onEdit} disabled={loading} className="p-2 rounded-full hover:bg-primary disabled:opacity-50" title="Edit Campaign">
                        <PencilIcon />
                    </button>
                    <button onClick={handleDelete} disabled={loading} className="p-2 rounded-full text-red-500 hover:bg-primary disabled:opacity-50" title="Delete Campaign">
                        <TrashIcon />
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border-color">
                            <th className="p-2 font-semibold text-text-secondary">Placement</th>
                            <th className="p-2 font-semibold text-text-secondary text-right">Impressions</th>
                            <th className="p-2 font-semibold text-text-secondary text-right">Clicks</th>
                            <th className="p-2 font-semibold text-text-secondary text-right">CTR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ad.analytics.map(slot => (
                            <tr key={slot.id}>
                                <td className="p-2 text-text-primary">{slot.placement}</td>
                                <td className="p-2 text-text-primary text-right font-mono">{slot.impressions.toLocaleString()}</td>
                                <td className="p-2 text-text-primary text-right font-mono">{slot.clicks.toLocaleString()}</td>
                                <td className="p-2 text-text-primary text-right font-mono">{((slot.clicks / slot.impressions) * 100 || 0).toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-border-color font-bold">
                             <td className="p-2 text-text-primary">Total</td>
                             <td className="p-2 text-text-primary text-right font-mono">{totalImpressions.toLocaleString()}</td>
                             <td className="p-2 text-text-primary text-right font-mono">{totalClicks.toLocaleString()}</td>
                             <td className="p-2 text-text-primary text-right font-mono">{overallCTR.toFixed(2)}%</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default SponsoredAdPerformanceCard;

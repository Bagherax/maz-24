import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { View, SponsoredAd, AdSlotAnalytics } from '../../types';
import { VIEWS } from '../../constants/views';
import * as api from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import KPICard from './KPICard';
import { ChartBarIcon } from '../../components/icons/ChartBarIcon';
import SponsoredAdPerformanceCard from './SponsoredAdPerformanceCard';
import CreateEditAdModal from './CreateEditAdModal';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon';

interface AdvertisingManagementProps {
    setActiveView: (view: View) => void;
}

export interface SponsoredAdWithAnalytics extends SponsoredAd {
    analytics: AdSlotAnalytics[];
}

const AdvertisingManagement: React.FC<AdvertisingManagementProps> = ({ setActiveView }) => {
    const [adsWithAnalytics, setAdsWithAnalytics] = useState<SponsoredAdWithAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<SponsoredAd | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { ads, analytics } = await api.getAdvertisingDashboardData();
            const combinedData = ads.map(ad => ({
                ...ad,
                analytics: analytics.filter(a => a.sponsoredAdId === ad.id),
            }));
            setAdsWithAnalytics(combinedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load advertising data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { totalImpressions, totalClicks, overallCTR } = useMemo(() => {
        let impressions = 0;
        let clicks = 0;
        adsWithAnalytics.forEach(ad => {
            ad.analytics.forEach(slot => {
                impressions += slot.impressions;
                clicks += slot.clicks;
            });
        });
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        return { totalImpressions: impressions, totalClicks: clicks, overallCTR: ctr.toFixed(2) + '%' };
    }, [adsWithAnalytics]);

    const handleEdit = (ad: SponsoredAd) => {
        setEditingAd(ad);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingAd(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingAd(null);
    };

    const handleSave = () => {
        handleModalClose();
        fetchData(); // Refresh data after create/edit
    };

    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KPICard title="Total Impressions" value={totalImpressions.toLocaleString()} icon={<ChartBarIcon />} />
                    <KPICard title="Total Clicks" value={totalClicks.toLocaleString()} icon={<ChartBarIcon />} />
                    <KPICard title="Overall CTR" value={overallCTR} icon={<ChartBarIcon />} />
                </div>

                <div className="space-y-4">
                    {adsWithAnalytics.map(ad => (
                        <SponsoredAdPerformanceCard
                            key={ad.id}
                            ad={ad}
                            onUpdate={fetchData}
                            onEdit={() => handleEdit(ad)}
                            onDelete={fetchData}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="py-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => setActiveView(VIEWS.ADMIN_DASHBOARD)} className="p-2 rounded-full hover:bg-secondary">
                        <ChevronLeftIcon />
                    </button>
                    <h2 className="text-2xl font-bold text-text-primary ml-2">Advertising Management</h2>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover"
                >
                    <PlusCircleIcon />
                    <span className="ml-2">Create New Ad</span>
                </button>
            </div>
            {renderContent()}
            {isModalOpen && (
                <CreateEditAdModal
                    ad={editingAd}
                    onClose={handleModalClose}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default AdvertisingManagement;

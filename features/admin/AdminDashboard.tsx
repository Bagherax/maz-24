import React, { useState, useEffect, useCallback } from 'react';
import type { View, Ad, AdminLogEntry, FullUser } from '../../types';
import { VIEWS } from '../../constants/views';
import * as api from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { HammerIcon } from '../../components/icons/HammerIcon';
import { BookOpenIcon } from '../../components/icons/BookOpenIcon';
import { ReportedAdCard } from './ReportedAdCard';
import { useAuth } from '../../context/AuthContext';
import { PaintBrushIcon } from '../../components/icons/PaintBrushIcon';
import { FolderPlusIcon } from '../../components/icons/FolderPlusIcon';
import { MegaphoneIcon } from '../../components/icons/MegaphoneIcon';


interface AdminDashboardProps {
    setActiveView: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveView }) => {
    const [liveListings, setLiveListings] = useState<Ad[]>([]);
    const [reportedListings, setReportedListings] = useState<Ad[]>([]);
    const [auditLog, setAuditLog] = useState<AdminLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { identity } = useAuth();
    const currentUser = identity as FullUser | null;


    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAdminDashboardData();
            setLiveListings(data.liveListings);
            setReportedListings(data.reportedListings);
            setAuditLog(data.auditLog);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load admin data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const Section: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
        <section className="bg-secondary rounded-lg border border-border-color p-4">
            <div className="flex items-center mb-4">
                <div className="text-accent">{icon}</div>
                <h3 className="text-xl font-bold text-text-primary ml-3">{title}</h3>
            </div>
            {children}
        </section>
    );
    
    const canEditTheme = currentUser?.type === 'FULL_USER' && (currentUser.role === 'super_admin' || currentUser.role === 'ui_editor');
    const canEditCategories = currentUser?.type === 'FULL_USER' && (currentUser.role === 'super_admin' || currentUser.role === 'policy_admin');

    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;

        return (
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {canEditTheme && (
                        <button 
                            onClick={() => setActiveView(VIEWS.THEME_EDITOR)}
                            className="w-full text-left p-4 bg-purple-900/50 rounded-lg border border-purple-700 hover:bg-purple-900/80 transition-colors flex items-center"
                        >
                            <PaintBrushIcon />
                            <span className="ml-3 font-semibold text-text-primary">UI Theme Editor</span>
                        </button>
                    )}
                     {canEditCategories && (
                        <button 
                            onClick={() => setActiveView(VIEWS.CATEGORY_EDITOR)}
                            className="w-full text-left p-4 bg-green-900/50 rounded-lg border border-green-700 hover:bg-green-900/80 transition-colors flex items-center"
                        >
                            <FolderPlusIcon />
                            <span className="ml-3 font-semibold text-text-primary">Manage Categories</span>
                        </button>
                    )}
                     <button 
                        onClick={() => setActiveView(VIEWS.ADVERTISING_MANAGEMENT)}
                        className="w-full text-left p-4 bg-yellow-900/50 rounded-lg border border-yellow-700 hover:bg-yellow-900/80 transition-colors flex items-center"
                    >
                        <MegaphoneIcon />
                        <span className="ml-3 font-semibold text-text-primary">Advertising</span>
                    </button>
                 </div>

                <section className="bg-secondary rounded-lg border border-border-color p-4">
                    <div className="flex items-center mb-4">
                        <div className="text-accent">
                            <EyeIcon />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary ml-3">Global Monitoring</h3>
                    </div>
                    <div className="p-3 bg-primary rounded-md">
                        <h4 className="font-semibold text-text-secondary">Live Listing Feed</h4>
                        <p className="text-sm text-text-secondary mt-1">
                            Showing <span className="font-bold text-text-primary">{liveListings.length}</span> active listings from the discovery index.
                        </p>
                    </div>
                </section>

                <Section icon={<HammerIcon />} title="Ethical Enforcement Engine">
                     {reportedListings.length > 0 ? (
                        <div className="space-y-3">
                             <p className="text-sm text-text-secondary mb-3">
                                Review user-reported listings. Takedowns remove ads from the public discovery index and block the link. This action <span className="font-bold text-text-primary">does not touch the ad data in the user's personal cloud</span>.
                            </p>
                            {reportedListings.map(ad => (
                                <ReportedAdCard key={ad.id} ad={ad} onActionCompleted={fetchData} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-text-secondary py-4">No reported listings in the queue.</p>
                    )}
                </Section>
                
                <Section icon={<BookOpenIcon />} title="Audit & Logging">
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {auditLog.map(log => (
                            <div key={log.id} className="p-2 bg-primary rounded-md text-xs">
                                <p className="font-mono text-text-primary">
                                    <span className="font-bold text-yellow-400">{log.adminUsername}</span> performed <span className="font-bold text-red-400">{log.action}</span> on <span className="font-bold text-cyan-400">{log.targetId}</span>
                                </p>
                                <p className="text-text-secondary mt-1">Reason: {log.reason}</p>
                                <p className="text-text-secondary/70 text-right">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
        );
    };

    return (
        <div className="py-4">
            <div className="flex items-center mb-6">
                <button onClick={() => setActiveView(VIEWS.PROFILE)} className="p-2 rounded-full hover:bg-secondary">
                    <ChevronLeftIcon />
                </button>
                <div className="ml-2">
                    <h2 className="text-2xl font-bold text-text-primary">Admin & Compliance</h2>
                    {currentUser?.type === 'FULL_USER' && currentUser.role && (
                        <p className="text-xs font-semibold text-accent -mt-1">
                            Role: {currentUser.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                    )}
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default AdminDashboard;

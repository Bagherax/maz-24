import React from 'react';
import Modal from '../../components/ui/Modal';
import { useMarketplace } from '../../hooks/useMarketplace';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PromotionAdCard from './PromotionAdCard';
import { useAuth } from '../../context/AuthContext';

interface PromotionModalProps {
    onClose: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ onClose }) => {
    const { myAds, loading, refreshMarketplaceData } = useMarketplace();
    const { identity } = useAuth();

    const renderContent = () => {
        if (loading) {
            return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
        }

        if (!identity || identity.type !== 'FULL_USER' || myAds.length === 0) {
            return (
                <div className="text-center p-8 text-text-secondary">
                    <h3 className="font-semibold text-text-primary">No Ads to Promote</h3>
                    <p className="text-sm mt-2">You need to create a listing before you can promote it.</p>
                </div>
            );
        }

        return (
            <>
                {myAds.map(ad => (
                    <PromotionAdCard key={ad.id} ad={ad} onActionComplete={refreshMarketplaceData} />
                ))}
            </>
        );
    };

    return (
        <Modal onClose={onClose} title="Promote Your Listings">
           <div className="h-[60vh] -m-6 p-4 space-y-3 bg-primary overflow-y-auto">
                <p className="text-sm text-text-secondary px-2 pb-2">Increase your ad's visibility by giving it a boost. More points means a higher rank in search results.</p>
                {renderContent()}
           </div>
        </Modal>
    );
};

export default PromotionModal;
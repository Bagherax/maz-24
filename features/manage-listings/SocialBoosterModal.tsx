import React, { useState } from 'react';
import type { Ad } from '../../types';
import Modal from '../../components/ui/Modal';
import { useNotification } from '../../hooks/useNotification';
// FIX: Corrected API import path to point to the module index.
import * as api from '../../api';
import { VerificationProgress } from './VerificationProgress';
import { TwitterIcon } from '../../components/icons/TwitterIcon';
import { FacebookIcon } from '../../components/icons/FacebookIcon';
import { CopyLinkIcon } from '../../components/icons/CopyLinkIcon';
import { RocketIcon } from '../../components/icons/RocketIcon';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon';

interface SocialBoosterModalProps {
  ad: Ad;
  onClose: () => void;
  onComplete: () => void;
}

type ViewState = 'share' | 'verifying' | 'complete';

const SocialBoosterModal: React.FC<SocialBoosterModalProps> = ({ ad, onClose, onComplete }) => {
  const [viewState, setViewState] = useState<ViewState>('share');
  const [result, setResult] = useState<{ success: boolean; message: string; newScore: number } | null>(null);
  const { addNotification } = useNotification();

  const handleShare = async (platform: string) => {
    setViewState('verifying');
    try {
        const shareResult = await api.boostAd(ad.id);
        setResult(shareResult);
        setViewState('complete');
        // The onComplete callback will refresh the ad list with the new score
        onComplete();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Boosting failed.';
        addNotification(message, 'error');
        onClose(); // Close modal on error
    }
  };

  const ShareButton: React.FC<{ platform: string; label: string; icon: React.ReactElement }> = ({ platform, label, icon }) => (
    <button
      onClick={() => handleShare(platform)}
      className="w-full flex items-center justify-center p-3 text-sm font-semibold rounded-md transition-colors bg-secondary border border-border-color hover:bg-border-color"
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  const renderShareView = () => (
    <div>
        <p className="text-sm text-text-secondary text-center mb-6">
            Share your ad to earn visibility points. Our <span className="font-bold text-text-primary">Anti-Cheat System</span> verifies genuine interactions to ensure fair boosting for everyone.
        </p>
        <div className="space-y-3">
            <ShareButton platform="twitter" label="Share on X" icon={<TwitterIcon />} />
            <ShareButton platform="facebook" label="Share on Facebook" icon={<FacebookIcon />} />
            <ShareButton platform="copy" label="Copy Secure Link" icon={<CopyLinkIcon />} />
        </div>
    </div>
  );

  const renderCompleteView = () => (
    <div className="text-center">
        {result?.success ? (
            <>
                <CheckCircleIcon />
                <h3 className="text-lg font-bold text-text-primary mt-4">Boost Successful!</h3>
                <p className="text-text-secondary mt-2">{result.message}</p>
                <div className="mt-4 text-2xl font-bold text-yellow-400 flex items-center justify-center">
                    <RocketIcon className="h-6 w-6" />
                    <span className="ml-2">{result.newScore} Total Points</span>
                </div>
            </>
        ) : (
            <>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-text-primary mt-4">Verification Failed</h3>
                <p className="text-text-secondary mt-2">{result?.message || 'An unexpected error occurred.'}</p>
            </>
        )}
        <button onClick={onClose} className="mt-6 w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover">
            Done
        </button>
    </div>
  );

  const renderContent = () => {
    switch(viewState) {
        case 'verifying':
            return <VerificationProgress />;
        case 'complete':
            return renderCompleteView();
        case 'share':
        default:
            return renderShareView();
    }
  };

  return (
    <Modal onClose={onClose} title="Social Booster">
      {renderContent()}
    </Modal>
  );
};

export default SocialBoosterModal;
import React from 'react';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { CopyLinkIcon } from '../../components/icons/CopyLinkIcon';
import { RocketIcon } from '../../components/icons/RocketIcon';

interface ShareAndEarnModalProps {
  onClose: () => void;
}

const ShareAndEarnModal: React.FC<ShareAndEarnModalProps> = ({ onClose }) => {
    const { identity } = useAuth();
    const { addNotification } = useNotification();
    
    if (identity?.type !== 'FULL_USER') {
        // This should not happen if invoked correctly, but as a safeguard.
        onClose();
        return null;
    }
    
    const invitationCode = `${identity.username.toUpperCase().slice(0, 5)}${identity.id.slice(-4)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(invitationCode).then(() => {
            addNotification('Invitation code copied!', 'success');
        }, () => {
            addNotification('Failed to copy code.', 'error');
        });
    };

    return (
        <Modal onClose={onClose} title="Share & Earn Rewards">
            <div className="text-center space-y-4">
                <RocketIcon className="h-12 w-12 mx-auto text-accent" />
                <p className="text-text-secondary">
                    Share your unique invitation code with friends. When they sign up using your code, you both receive <span className="font-bold text-text-primary">50 Boost Points</span> to promote your ads!
                </p>
                <div className="p-4 bg-primary border-2 border-dashed border-border-color rounded-lg">
                    <p className="text-sm font-semibold text-text-secondary">Your Invitation Code</p>
                    <p className="text-2xl font-bold tracking-widest text-accent my-2">{invitationCode}</p>
                </div>
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center p-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                >
                    <CopyLinkIcon />
                    <span className="ml-2">Copy Code</span>
                </button>
            </div>
        </Modal>
    );
};

export default ShareAndEarnModal;
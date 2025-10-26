import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';
import type { FullUser } from '../../types';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { UserCheckIcon } from '../icons/UserCheckIcon';

interface FollowButtonProps {
    sellerId: string;
    className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ sellerId, className }) => {
    const { identity, updateCurrentUser, promptForIdentity } = useAuth();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    if (!identity || identity.type !== 'FULL_USER' || identity.id === sellerId) {
        // Hide button if it's the user's own profile or if the user is a guest (guests are prompted on click)
        if(identity?.id === sellerId) return null;
    }

    const isFollowing = (identity as FullUser)?.followingIds?.includes(sellerId) || false;

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!identity) {
            promptForIdentity();
            return;
        }
        if (identity.type !== 'FULL_USER') return;

        setLoading(true);
        try {
            const updatedUser = isFollowing
                ? await api.unfollowUser(sellerId)
                : await api.followUser(sellerId);
            
            updateCurrentUser(updatedUser);
            addNotification(isFollowing ? 'Unfollowed user.' : 'Followed user!', 'success', 2000);
        } catch (error) {
            addNotification(error instanceof Error ? error.message : 'Action failed', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const baseClasses = "flex items-center justify-center font-semibold rounded-lg transition-colors disabled:opacity-50";
    const followingClasses = "bg-secondary text-text-primary border border-border-color hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400";
    const followClasses = "bg-accent text-white hover:bg-accent-hover";
    const appliedClasses = isFollowing ? followingClasses : followClasses;

    const text = isFollowing ? 'Following' : 'Follow';
    const icon = isFollowing ? <UserCheckIcon className="h-5 w-5" /> : <UserPlusIcon className="h-5 w-5" />;

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`${baseClasses} ${appliedClasses} ${className}`}
        >
            {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
                <>
                    {icon}
                    <span className="ml-2">{text}</span>
                </>
            )}
        </button>
    );
};
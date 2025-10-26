import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FullUser } from '../types';

const Profile: React.FC = () => {
  // FIX: Destructure 'identity' from useAuth, as 'currentUser' is not provided.
  const { identity, logout } = useAuth();
    
  // This component should only render for a full user.
  if (!identity || identity.type !== 'FULL_USER') {
    // This case is handled by the main App component, but as a safeguard:
    return null;
  }
  
  // After the check, we can safely use the identity as a full user.
  const currentUser = identity as FullUser;

  const tierColor: { [key: string]: string } = {
    normal: 'bg-gray-500',
    bronze: 'bg-yellow-700',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-blue-300',
    diamond: 'bg-cyan-400',
    su_diamond: 'bg-purple-500',
    MAZ: 'bg-gradient-to-r from-purple-500 to-indigo-500',
  }

  return (
    <div className="py-4">
      <div className="flex flex-col items-center">
        <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-24 h-24 rounded-full border-4 border-accent" />
        <h2 className="text-2xl font-bold mt-4 text-text-primary">{currentUser.username}</h2>
        <p className="text-text-secondary">{currentUser.email}</p>
        <div className={`mt-2 px-3 py-1 text-xs font-bold text-white rounded-full ${tierColor[currentUser.tier]}`}>
          {currentUser.tier.toUpperCase()} Member
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        <button className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color hover:bg-white/5 transition-colors">
          Manage Listings
        </button>
        <button className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color hover:bg-white/5 transition-colors">
          Settings
        </button>
        
        <div className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className="ml-3 font-semibold text-text-primary">Your Personal Cloud</span>
                </div>
                <span className="text-xs font-semibold bg-blue-600/50 text-blue-200 px-2 py-1 rounded-full">COMING SOON</span>
            </div>
            <div className="pl-9">
                <p className="text-sm text-text-secondary mt-2">
                    Manage your data in your secure, self-hosted storage powered by Nextcloud/MinIO.
                </p>
                <p className="text-xs text-accent mt-2">
                    ✨ Featuring <span className="font-bold">Smart Sync</span> for seamless offline and online access.
                </p>
            </div>
        </div>

        <button
          onClick={logout}
          className="w-full p-4 bg-red-800/20 text-red-400 rounded-lg border border-red-800/50 hover:bg-red-800/40 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
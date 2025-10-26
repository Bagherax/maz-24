import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { VIEWS } from '../../constants/views';
import type { View, CloudConfig, FullUser, User } from '../../types';
import * as api from '../../api';
import CloudConfigModal from './CloudConfigModal';
import { useNotification } from '../../hooks/useNotification';
import { InfrastructureInfo } from './InfrastructureInfo';
import { AdminPanelIcon } from '../../components/icons/AdminPanelIcon';
import { GuestIcon } from '../../components/icons/GuestIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { CloudIcon } from '../../components/icons/CloudIcon';
import { CogIcon } from '../../components/icons/CogIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { ChatIcon } from '../../components/icons/ChatIcon';
import { LogoutIcon } from '../../components/icons/LogoutIcon';
import { CameraIcon } from '../../components/icons/CameraIcon';
import { useMarketplace } from '../../hooks/useMarketplace';

interface ProfileProps {
    setActiveView: (view: View) => void;
}

const ActionItem: React.FC<{ icon: React.ReactElement; label: string; onClick: () => void; className?: string }> = ({ icon, label, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 bg-primary rounded-lg border border-border-color hover:bg-border-color transition-colors flex items-center justify-between group ${className}`}
    >
        <div className="flex items-center">
            <div className="w-6 h-6 text-accent group-hover:text-accent-hover transition-colors">{icon}</div>
            <span className="ml-4 font-semibold text-text-primary">{label}</span>
        </div>
        <div className="text-text-secondary">
            <ChevronRightIcon />
        </div>
    </button>
);


const EditableImage: React.FC<{
    isEditing: boolean;
    src: string;
    onFileSelect: (file: File) => void;
    children: React.ReactNode;
    className?: string;
    inputAccept?: string;
}> = ({ isEditing, src, onFileSelect, children, className, inputAccept = "image/*" }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };
    return (
        <div className={`relative group ${className || ''}`}>
            {children}
            {isEditing && (
                <div 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="text-white flex items-center bg-black/50 p-2 rounded-full">
                        <CameraIcon />
                        <span className="ml-2 text-sm font-semibold">Change</span>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={inputAccept}
                        onChange={handleFileChange}
                    />
                </div>
            )}
        </div>
    );
};

const Profile: React.FC<ProfileProps> = ({ setActiveView }) => {
  const { identity, logout, promptForIdentity, updateCurrentUser } = useAuth();
  const { myAds } = useMarketplace();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig | null>(null);
  const { addNotification } = useNotification();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);

  const currentUser = identity?.type === 'FULL_USER' ? (identity as FullUser) : null;
  
  useEffect(() => {
    if (currentUser) {
        setFormData({
            username: currentUser.username,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl,
            profileBannerUrl: currentUser.profileBannerUrl,
            profileBackgroundUrl: currentUser.profileBackgroundUrl,
        });
    }
  }, [currentUser]);


  const fetchCloudConfig = useCallback(async () => {
    if (identity?.type === 'FULL_USER') {
        const config = await api.getCloudConfig();
        setCloudConfig(config);
    }
  }, [identity]);

  useEffect(() => {
    fetchCloudConfig();
  }, [fetchCloudConfig]);
  
  const handleFieldChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleImageChange = (field: 'avatarUrl' | 'profileBannerUrl' | 'profileBackgroundUrl', file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          setFormData(prev => ({...prev, [field]: reader.result as string}));
      }
      reader.readAsDataURL(file);
  };
  
  const handleCancel = () => {
      if (currentUser) {
          setFormData({
            username: currentUser.username,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl,
            profileBannerUrl: currentUser.profileBannerUrl,
            profileBackgroundUrl: currentUser.profileBackgroundUrl,
        });
      }
      setIsEditing(false);
  }
  
  const handleSave = async () => {
      setSaving(true);
      try {
          const updatedUser = await api.updateUserProfile(formData);
          updateCurrentUser(updatedUser);
          addNotification("Profile updated successfully!", 'success');
          setIsEditing(false);
      } catch (err) {
          addNotification(err instanceof Error ? err.message : "Failed to update profile", "error");
      } finally {
          setSaving(false);
      }
  };
    
  if (!identity) {
    return (
        <div className="py-4 flex flex-col items-center justify-center text-center h-full">
            <GuestIcon />
            <h2 className="text-2xl font-bold mt-4 text-text-primary">You are a Guest</h2>
            <p className="text-text-secondary mt-2 max-w-xs">
                Create a temporary or permanent identity to post ads, chat with sellers, and manage your data.
            </p>
            <button
                onClick={promptForIdentity}
                className="mt-6 w-full max-w-xs p-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
                Get Started
            </button>
        </div>
    );
  }
  
  const tierColor: { [key: string]: string } = {
    normal: 'bg-gray-500 text-white',
    bronze: 'bg-yellow-700 text-white',
    silver: 'bg-gray-400 text-white',
    gold: 'bg-yellow-500 text-white',
    platinum: 'bg-blue-300 text-white',
    diamond: 'bg-cyan-400 text-white',
    su_diamond: 'bg-purple-500 text-white',
    MAZ: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
  }
  
  if (identity.type === 'TEMP_USER') {
      return (
        <div className="py-4 flex flex-col items-center justify-center text-center h-full bg-secondary rounded-xl border border-border-color">
            <img src={`https://picsum.photos/seed/${identity.id}/200`} alt={identity.username} className="w-24 h-24 rounded-full border-4 border-accent shadow-lg" />
            <h2 className="text-2xl font-bold mt-4 text-text-primary">{identity.username}</h2>
            <div className="mt-2 px-3 py-1 text-xs font-bold text-white rounded-full bg-gray-500">
              TEMPORARY
            </div>
            <p className="text-text-secondary mt-4 max-w-xs">
                Your data (ads, chats) is stored locally and will be deleted when you close the session.
            </p>
            <button
                onClick={promptForIdentity}
                className="mt-6 w-full max-w-xs p-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
                Sign Up to Save Your Data
            </button>
             <button
                onClick={logout}
                className="mt-2 text-sm text-text-secondary hover:underline"
            >
                Or start over as a new guest
            </button>
        </div>
      );
  }

  // After this check, identity is a FullUser.
  if (!currentUser) return null; // Should not happen

  const handleSaveCloudConfig = () => {
    fetchCloudConfig();
    setIsConfigModalOpen(false);
  }

  const backgroundStyle = formData.profileBackgroundUrl ? { backgroundImage: `url(${formData.profileBackgroundUrl})` } : {};
  const bannerStyle = formData.profileBannerUrl ? { backgroundImage: `url(${formData.profileBannerUrl})` } : {};

  return (
    <>
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all" 
        style={backgroundStyle}
      />
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />

      <div className="relative py-4 space-y-8">
        <EditableImage isEditing={isEditing} src={formData.profileBackgroundUrl || ''} onFileSelect={(file) => handleImageChange('profileBackgroundUrl', file)} className="-mx-4">
            <div 
                className="h-48 bg-secondary bg-cover bg-center border-b border-border-color"
                style={bannerStyle}
            >
                <EditableImage isEditing={isEditing} src={formData.profileBannerUrl || ''} onFileSelect={(file) => handleImageChange('profileBannerUrl', file)} className="h-full">
                    <div className="h-full w-full" />
                </EditableImage>
            </div>
        </EditableImage>

        {/* Profile Header */}
        <section className="px-4 -mt-24">
            <div className="flex items-end space-x-4">
                 <EditableImage isEditing={isEditing} src={formData.avatarUrl || ''} onFileSelect={(file) => handleImageChange('avatarUrl', file)} className="w-28 h-28 rounded-full border-4 border-primary shadow-lg bg-secondary">
                    <img src={formData.avatarUrl} alt={formData.username} className="w-full h-full rounded-full object-cover" />
                 </EditableImage>
                
                 <div className="pb-2 flex-1 flex items-center justify-between">
                     {isEditing ? (
                         <div className="flex-1">
                            <input type="text" value={formData.username} onChange={e => handleFieldChange('username', e.target.value)} className="text-2xl font-bold bg-secondary/80 text-text-primary rounded-md px-2 py-1 w-full" />
                         </div>
                     ) : (
                        <h2 className="text-2xl font-bold text-text-primary">{formData.username}</h2>
                     )}
                    
                     {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-text-secondary bg-secondary/50 hover:bg-secondary transition-colors" aria-label="Edit Profile">
                            <PencilIcon />
                        </button>
                    ) : (
                        <div className="flex items-center space-x-2">
                             <button onClick={handleCancel} className="px-3 py-1.5 text-sm font-semibold rounded-lg text-text-secondary bg-secondary hover:bg-border-color">Cancel</button>
                             <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50">
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    )}
                 </div>
            </div>
             <div className="mt-2">
                 {isEditing ? (
                     <input type="email" value={formData.email} onChange={e => handleFieldChange('email', e.target.value)} className="text-sm bg-secondary/80 text-text-secondary rounded-md px-2 py-1 w-full" />
                 ) : (
                    <p className="text-sm text-text-secondary">{formData.email}</p>
                 )}
                <div className={`mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full ${tierColor[currentUser.tier]}`}>
                    {currentUser.tier.toUpperCase()} Member
                </div>
            </div>
        </section>

        <section className="px-4 mt-4 grid grid-cols-3 gap-4 text-center divide-x divide-border-color bg-secondary p-4 rounded-xl">
            <div>
                <p className="text-xl font-bold text-text-primary">{myAds.length}</p>
                <p className="text-xs text-text-secondary">Listings</p>
            </div>
            <div>
                <p className="text-xl font-bold text-text-primary">{currentUser.followersCount || 0}</p>
                <p className="text-xs text-text-secondary">Followers</p>
            </div>
            <div>
                <p className="text-xl font-bold text-text-primary">{currentUser.followingIds?.length || 0}</p>
                <p className="text-xs text-text-secondary">Following</p>
            </div>
        </section>


        {/* Main Actions */}
        <section className="space-y-3 mt-8">
             <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider px-2">Marketplace</h3>
            <div className="bg-secondary p-2 rounded-xl border border-border-color space-y-2">
                <ActionItem label="Manage Your Listings" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>} onClick={() => setActiveView(VIEWS.MANAGE_LISTINGS)} />
                <ActionItem label="Message Center" icon={<ChatIcon />} onClick={() => setActiveView(VIEWS.CHAT)} />
            </div>
        </section>
        
         {/* Data & Admin */}
        <section className="space-y-3">
             <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider px-2">Data &amp; Admin</h3>
            <div className="bg-secondary p-2 rounded-xl border border-border-color space-y-2">
                 <ActionItem label={cloudConfig ? `Cloud: ${cloudConfig.provider}` : "Connect Personal Cloud"} icon={<CloudIcon />} onClick={() => setIsConfigModalOpen(true)} />
                {currentUser.tier === 'MAZ' && (
                    <ActionItem label="Admin & Compliance" icon={<AdminPanelIcon />} onClick={() => setActiveView(VIEWS.ADMIN_DASHBOARD)} />
                )}
                 <ActionItem label="Account Settings" icon={<CogIcon />} onClick={() => addNotification('Settings page coming soon!', 'info')} />
            </div>
        </section>

        {/* Logout */}
         <section className="pt-4">
            <button
                onClick={logout}
                className="w-full p-3 bg-secondary text-red-500 rounded-lg border border-border-color hover:bg-red-500/10 hover:border-red-500/20 transition-colors flex items-center justify-center font-semibold"
            >
                <LogoutIcon />
                <span className="ml-2">Logout</span>
            </button>
        </section>
      </div>
      {isConfigModalOpen && (
          <CloudConfigModal 
            onClose={() => setIsConfigModalOpen(false)}
            onSave={handleSaveCloudConfig}
            currentConfig={cloudConfig}
          />
      )}
    </>
  );
};

export default Profile;
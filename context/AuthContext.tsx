import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User, TempUser, Identity, FullUser } from '../types';
import * as api from '../api';

type AuthModalState = 'closed' | 'temp_prompt' | 'login' | 'register';

interface AuthContextType {
  identity: Identity | null;
  loading: boolean;
  authModalState: AuthModalState;
  login: typeof api.login;
  register: typeof api.register;
  logout: typeof api.logout;
  promptForIdentity: () => void;
  createTempIdentity: () => void;
  closeAuthModal: () => void;
  setAuthModalState: (state: AuthModalState) => void;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalState, setAuthModalState] = useState<AuthModalState>('closed');

  const handleAuthChange = (user: User | null) => {
    if (user) {
        setIdentity({ type: 'FULL_USER', ...user });
    } else {
        // If there's no full user, check for a session-based temp user
        const tempUserJson = sessionStorage.getItem('mazdady_temp_user');
        if (tempUserJson) {
            setIdentity(JSON.parse(tempUserJson));
        } else {
            setIdentity(null); // Guest
        }
    }
  };

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const user = await api.getCurrentUser();
        handleAuthChange(user);
      } catch (error) {
        console.error("Failed to fetch current user", error);
        handleAuthChange(null);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
    
    const unsubscribe = api.onAuthChange((user) => {
      handleAuthChange(user);
      if (user) {
        // If a full user logs in, close any auth modals and clear temp session
        sessionStorage.removeItem('mazdady_temp_user');
        setAuthModalState('closed');
      }
    });

    return () => unsubscribe();
  }, []);

  const promptForIdentity = () => setAuthModalState('temp_prompt');
  const closeAuthModal = () => setAuthModalState('closed');
  
  const createTempIdentity = () => {
      const tempUser: TempUser = {
          type: 'TEMP_USER',
          id: `temp_${Date.now()}`,
          username: 'Temporary Guest'
      };
      sessionStorage.setItem('mazdady_temp_user', JSON.stringify(tempUser));
      setIdentity(tempUser);
      setAuthModalState('closed');
  };

  const performLogout = async () => {
      await api.logout();
      sessionStorage.removeItem('mazdady_temp_user');
      setIdentity(null); // Revert to guest state
  };

  const updateCurrentUser = (user: User) => {
      if (identity?.type === 'FULL_USER') {
          const updatedIdentity: FullUser = { ...user, type: 'FULL_USER' };
          setIdentity(updatedIdentity);
          // The API service handles the persistence, but we also update the JWT here
          // to ensure consistency if this function is called from client-only logic in the future.
          localStorage.setItem('mazdady_jwt', JSON.stringify(updatedIdentity));
      }
  };

  const value = {
    identity,
    loading,
    authModalState,
    login: api.login,
    register: api.register,
    logout: performLogout,
    promptForIdentity,
    createTempIdentity,
    closeAuthModal,
    setAuthModalState,
    updateCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

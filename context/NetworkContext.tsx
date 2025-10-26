import React, { createContext, useState, useCallback, ReactNode } from 'react';

const NETWORK_STATUS_KEY = 'mazdady_network_status';

interface NetworkContextType {
  isOnline: boolean;
  toggleNetworkStatus: () => void;
}

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Initialize state from localStorage to persist across reloads
    return localStorage.getItem(NETWORK_STATUS_KEY) !== 'offline';
  });

  const toggleNetworkStatus = useCallback(() => {
    setIsOnline(prevIsOnline => {
      const newIsOnline = !prevIsOnline;
      if (newIsOnline) {
        localStorage.setItem(NETWORK_STATUS_KEY, 'online');
      } else {
        localStorage.setItem(NETWORK_STATUS_KEY, 'offline');
      }
      // NOTE: In a real app, components would need to re-fetch data.
      // Here, navigating away and back to a view will trigger a re-fetch.
      // We could also dispatch a global event if immediate refresh is needed.
      return newIsOnline;
    });
  }, []);

  const value = { isOnline, toggleNetworkStatus };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};
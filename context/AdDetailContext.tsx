import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AdDetailContextType {
  activeAdId: string | null;
  openAdDetail: (adId: string) => void;
  closeAdDetail: () => void;
}

const AdDetailContext = createContext<AdDetailContextType | undefined>(undefined);

export const AdDetailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeAdId, setActiveAdId] = useState<string | null>(null);

  const openAdDetail = (adId: string) => {
    setActiveAdId(adId);
  };

  const closeAdDetail = () => {
    setActiveAdId(null);
  };

  const value = {
    activeAdId,
    openAdDetail,
    closeAdDetail,
  };

  return (
    <AdDetailContext.Provider value={value}>
      {children}
    </AdDetailContext.Provider>
  );
};

export const useAdDetail = (): AdDetailContextType => {
  const context = useContext(AdDetailContext);
  if (context === undefined) {
    throw new Error('useAdDetail must be used within an AdDetailProvider');
  }
  return context;
};
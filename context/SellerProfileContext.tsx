import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SellerProfileContextType {
  activeSellerId: string | null;
  openSellerProfile: (sellerId: string) => void;
  closeSellerProfile: () => void;
}

const SellerProfileContext = createContext<SellerProfileContextType | undefined>(undefined);

export const SellerProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);

  const openSellerProfile = (sellerId: string) => {
    setActiveSellerId(sellerId);
  };

  const closeSellerProfile = () => {
    setActiveSellerId(null);
  };

  const value = {
    activeSellerId,
    openSellerProfile,
    closeSellerProfile,
  };

  return (
    <SellerProfileContext.Provider value={value}>
      {children}
    </SellerProfileContext.Provider>
  );
};

export const useSellerProfile = (): SellerProfileContextType => {
  const context = useContext(SellerProfileContext);
  if (context === undefined) {
    throw new Error('useSellerProfile must be used within a SellerProfileProvider');
  }
  return context;
};

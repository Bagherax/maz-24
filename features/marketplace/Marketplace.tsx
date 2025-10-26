import React, { useState, useEffect } from 'react';
import AdCard from '../../components/ui/AdCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useMarketplace } from '../../hooks/useMarketplace';
import SettingsPanel from './SettingsPanel';
import { SettingsIcon } from '../../components/icons/SettingsIcon';
import type { View, SponsoredAd } from '../../types';
import * as api from '../../api';
import SponsoredAdCard from '../../components/ui/SponsoredAdCard';


interface MarketplaceProps {
  setActiveView: (view: View) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ setActiveView }) => {
  const { filteredAds, loading, error, viewMode } = useMarketplace();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredAd[]>([]);

  useEffect(() => {
    const fetchSponsorAds = async () => {
      const ads = await api.getSponsoredAds();
      setSponsoredAds(ads);
    }
    fetchSponsorAds();
  }, []);


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }
  
  const gridClasses = {
    grid: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4',
    large: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  };

  return (
    <div className="py-4">
      <div className="h-8 flex justify-end items-center mb-4">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full text-text-secondary hover:bg-secondary hover:text-text-primary transition-colors"
          aria-label="Open settings panel"
        >
          <SettingsIcon />
        </button>
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        setActiveView={setActiveView} 
      />

      <div className={`grid ${gridClasses[viewMode]}`}>
        {filteredAds.reduce((acc: React.ReactNode[], ad, index) => {
          acc.push(<AdCard key={ad.id} ad={ad} viewMode={viewMode} />);
          // Insert a sponsored ad after every 6 regular ads
          if (sponsoredAds.length > 0 && (index + 1) % 6 === 0) {
            const adIndex = Math.floor((index + 1) / 6 - 1) % sponsoredAds.length;
            const sponsoredAd = sponsoredAds[adIndex];
            acc.push(<SponsoredAdCard key={`sponsored-${index}`} ad={sponsoredAd} placement="Marketplace Feed" />);
          }
          return acc;
        }, [])}
      </div>
       {filteredAds.length === 0 && (
        <div className="col-span-full text-center py-10 text-text-secondary">
          <p>No listings found for this category.</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

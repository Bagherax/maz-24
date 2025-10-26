import React, { useState, useEffect } from 'react';
import type { Ad } from '../types';
import { getAds } from '../services/apiService';
import AdCard from './AdCard';
import LoadingSpinner from './LoadingSpinner';

const Marketplace: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const fetchedAds = await getAds();
        setAds(fetchedAds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ads');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Explore Marketplace</h2>
      <div className="grid grid-cols-2 gap-4">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </div>
  );
};

export default Marketplace;

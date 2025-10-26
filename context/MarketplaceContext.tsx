import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Ad } from '../types';
import * as api from '../api';
import { useAuth } from './AuthContext';
import { useNetwork } from '../hooks/useNetwork';

type FilterType = 'all' | 'buy-now' | 'auction';
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity';
export type ViewMode = 'grid' | 'large';


interface MarketplaceContextType {
  ads: Ad[];
  myAds: Ad[];
  filteredAds: Ad[];
  loading: boolean;
  error: string | null;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  categoryPathFilter: string[] | null;
  setCategoryPathFilter: (path: string[] | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  refreshMarketplaceData: () => Promise<void>;
}

export const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [categoryPathFilter, setCategoryPathFilter] = useState<string[] | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const { identity: currentUser } = useAuth();
  const { isOnline } = useNetwork();
  
  const refreshMarketplaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedAds, fetchedMyAds] = await Promise.all([
        api.getAds(),
        api.getMyAds()
      ]);
      setAds(fetchedAds);
      setMyAds(fetchedMyAds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch marketplace data.';
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMarketplaceData();
  }, [refreshMarketplaceData, currentUser]); // Refresh when user logs in/out or their following list changes

  useEffect(() => {
    const wasOffline = !isOnline; 
    if (wasOffline) return;

    if (isOnline) {
        refreshMarketplaceData();
    }
  }, [isOnline, refreshMarketplaceData]);
  
  const filteredAds = useMemo(() => {
    let result = ads;
    
    // Category filter takes precedence.
    if (categoryPathFilter && categoryPathFilter.length > 0) {
        result = result.filter(ad => {
            if (!ad.categoryPath) return false;
            // Check if ad's path starts with the filter path
            return categoryPathFilter.every((segment, index) => ad.categoryPath && ad.categoryPath[index] === segment);
        });
    } else {
        // Only apply other filters if category is not set
        if (filter !== 'all') {
          result = result.filter(ad => ad.listingType === filter);
        }

        if (searchTerm.trim()) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            result = result.filter(ad => 
                ad.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                ad.description.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }
    }

    // Apply sorting
    const sortedResult = [...result];
    switch (sortOption) {
      case 'price-asc':
        sortedResult.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedResult.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        sortedResult.sort((a, b) => {
          const popA = (a.reviews || 0) + (a.boostScore || 0);
          const popB = (b.reviews || 0) + (b.boostScore || 0);
          return popB - popA;
        });
        break;
      case 'newest':
      default:
        // The default sort from the API is now by followed status, then score, then newest
        // So we don't need to re-sort here unless a different option is chosen.
        // We can rely on the API's sorting for 'newest' (which is the effective default)
        break;
    }

    return sortedResult;
  }, [ads, filter, searchTerm, sortOption, categoryPathFilter]);

  const handleSetCategoryPathFilter = (path: string[] | null) => {
    setCategoryPathFilter(path);
    // Clear other filters for a predictable user experience
    if (path) {
        setSearchTerm('');
        setFilter('all');
    }
  };

  const value = {
    ads,
    myAds,
    filteredAds,
    loading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption,
    categoryPathFilter,
    setCategoryPathFilter: handleSetCategoryPathFilter,
    viewMode,
    setViewMode,
    refreshMarketplaceData,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};
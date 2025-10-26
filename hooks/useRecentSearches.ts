import { useState, useCallback, useEffect } from 'react';

const RECENT_SEARCHES_KEY = 'mazdady_recent_searches';
const MAX_SEARCHES = 5;

export const useRecentSearches = () => {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (storedSearches) {
        setSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
      setSearches([]);
    }
  }, []);

  const addSearch = useCallback((query: string) => {
    if (!query) return;
    const cleanedQuery = query.trim();

    setSearches(prevSearches => {
      // Remove existing entry to move it to the front
      const filtered = prevSearches.filter(s => s.toLowerCase() !== cleanedQuery.toLowerCase());
      const newSearches = [cleanedQuery, ...filtered].slice(0, MAX_SEARCHES);
      
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      } catch (error) {
        console.error("Failed to save recent searches:", error);
      }
      
      return newSearches;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Failed to clear recent searches:", error);
    }
  }, []);

  return { searches, addSearch, clearSearches };
};

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import * as api from '../api';
import { useMarketplace } from '../hooks/useMarketplace';
import type { AiCommandResult, SearchIndexEntry } from '../api/masaService';
import type { View } from '../types';
import { useRecentSearches } from '../hooks/useRecentSearches';

interface SearchContextType {
  isSearchPanelOpen: boolean;
  openSearchPanel: () => void;
  closeSearchPanel: () => void;
  query: string;
  setQuery: (newQuery: string) => void;
  suggestion: string | null;
  acceptSuggestion: () => void;
  commandResult: AiCommandResult | null;
  loading: boolean;
  executeQuery: (directQuery?: string) => void;
  handleCommandAction: (command: AiCommandResult, setActiveView: (view: View) => void) => void;
  recentSearches: string[];
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [commandResult, setCommandResult] = useState<AiCommandResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { ads, setSearchTerm, setCategoryPathFilter } = useMarketplace();
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[]>([]);
  const { searches: recentSearches, addSearch: addRecentSearch, clearSearches: clearRecentSearches } = useRecentSearches();

  useEffect(() => {
    if (ads.length > 0) {
        const index = api.generateSearchIndexFromAds(ads);
        setSearchIndex(index);
    }
  }, [ads]);

  const openSearchPanel = () => setIsSearchPanelOpen(true);
  const closeSearchPanel = useCallback(() => {
    setIsSearchPanelOpen(false);
    setQuery('');
    setSuggestion(null);
    setCommandResult(null);
  }, []);
  
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setCommandResult(null);

    if (newQuery.trim()) {
        const newSuggestion = api.getAutocompleteSuggestion(newQuery, searchIndex);
        setSuggestion(newSuggestion);
    } else {
        setSuggestion(null);
    }
  }, [searchIndex]);

  const acceptSuggestion = useCallback(() => {
    if (suggestion) {
        setQuery(prevQuery => prevQuery + suggestion);
        setSuggestion(null);
    }
  }, [suggestion]);

  const executeQuery = useCallback(async (directQuery?: string) => {
    const finalQuery = (directQuery ?? (query + (suggestion || ''))).trim();
    if (!finalQuery) return;

    addRecentSearch(finalQuery);
    
    if(!directQuery) {
        setQuery(finalQuery);
    }
    setSuggestion(null);
    setLoading(true);
    setCommandResult(null);

    try {
      const result = await api.parseAiCommand(finalQuery, ads);
      setCommandResult(result);
    } catch (error) {
      console.error("AI command execution failed:", error);
      setCommandResult({ type: 'error', payload: "Sorry, an error occurred while processing your command." });
    } finally {
      setLoading(false);
    }
  }, [query, suggestion, ads, addRecentSearch]);

  const handleCommandAction = (command: AiCommandResult, setActiveView: (view: View) => void) => {
      switch(command.type) {
          case 'apply_filters':
              if (command.payload.searchTerm) {
                  setSearchTerm(command.payload.searchTerm);
              }
              setCategoryPathFilter(null); // Clear category filter
              closeSearchPanel();
              break;
          case 'apply_category_filter':
              setCategoryPathFilter(command.payload.path);
              closeSearchPanel();
              break;
          case 'navigate':
              setActiveView(command.payload.view);
              closeSearchPanel();
              break;
          default:
              break;
      }
  };


  const value = {
    isSearchPanelOpen,
    openSearchPanel,
    closeSearchPanel,
    query,
    setQuery: updateQuery,
    suggestion,
    acceptSuggestion,
    commandResult,
    loading,
    executeQuery,
    handleCommandAction,
    recentSearches,
    clearRecentSearches,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
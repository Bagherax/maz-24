import React, { useEffect, useState } from 'react';
import { useSearch } from '../../context/SearchContext';
import { useNotification } from '../../hooks/useNotification';
import type { View } from '../../types';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import CategoryBrowser from './CategoryBrowser';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';

interface SearchPanelProps {
    setActiveView: (view: View) => void;
}

const RecentSearches: React.FC<{
  onSelect: (query: string) => void;
}> = ({ onSelect }) => {
  const { recentSearches, clearRecentSearches } = useSearch();

  if (!recentSearches || recentSearches.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-b border-border-color">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Recent Searches</h4>
        <button onClick={clearRecentSearches} className="flex items-center text-xs font-semibold text-text-secondary hover:text-red-500 transition-colors">
            <TrashIcon />
            <span className="ml-1">Clear</span>
        </button>
      </div>
      <ul className="space-y-1">
        {recentSearches.map((search, index) => (
          <li key={index}>
            <button
              onClick={() => onSelect(search)}
              className="w-full text-left flex items-center p-2 rounded-md hover:bg-primary transition-colors"
            >
              <ClockIcon className="h-4 w-4 text-text-secondary mr-3 flex-shrink-0" />
              <span className="text-sm text-text-primary truncate">{search}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SearchPanel: React.FC<SearchPanelProps> = ({ setActiveView }) => {
    const {
        commandResult,
        loading,
        handleCommandAction,
        executeQuery,
        closeSearchPanel,
    } = useSearch();
    const { addNotification } = useNotification();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Animate in on mount
        const timer = setTimeout(() => setIsAnimating(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (commandResult) {
            if ('message' in commandResult && commandResult.message) {
                addNotification(commandResult.message, 'info');
            }
            handleCommandAction(commandResult, setActiveView);
        }
    }, [commandResult, handleCommandAction, setActiveView, addNotification]);

    const handleCategorySelect = (path: string[]) => {
        const query = `Show me items in ${path.join(' > ')}`;
        executeQuery(query);
    };

    const renderContent = () => {
        if (loading) {
             return (
                <div className="text-center text-text-secondary p-4 animate-pulse">
                    <SparklesIcon className="h-5 w-5 mx-auto text-accent"/>
                    <p className="mt-2 text-xs">MAZ-AI is thinking...</p>
                </div>
            );
        }
        if (commandResult) {
            switch (commandResult.type) {
                case 'text_response':
                    return <p className="text-sm text-text-primary whitespace-pre-wrap p-4 bg-primary rounded-lg">{commandResult.payload}</p>;
                case 'error':
                     return <p className="text-sm text-red-400 p-4 bg-red-900/50 rounded-lg">{commandResult.payload}</p>;
                default:
                    // For commands that cause navigation/filtering, we show nothing in the panel
                    // as it will close immediately.
                    return null;
            }
        }
        
        return (
            <>
                <RecentSearches onSelect={executeQuery} />
                <CategoryBrowser onCategorySelect={handleCategorySelect} onClose={closeSearchPanel} />
            </>
        );
    };

    return (
        <div className={`search-panel ${isAnimating ? 'open' : ''}`}>
            {renderContent()}
        </div>
    );
};

export default SearchPanel;
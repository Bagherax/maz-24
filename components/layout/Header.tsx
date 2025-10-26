import React from 'react';
import { useNetwork } from '../../hooks/useNetwork';
import AskAiSearch from '../ui/AskAiSearch';
import { useSearch } from '../../context/SearchContext';
import SearchPanel from '../../features/search/SearchPanel';
import type { View } from '../../types';

interface HeaderProps {
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ setActiveView }) => {
  const { isOnline, toggleNetworkStatus } = useNetwork();
  const { isSearchPanelOpen, closeSearchPanel } = useSearch();

  return (
    <>
      {isSearchPanelOpen && <div className="search-panel-backdrop" onClick={closeSearchPanel} />}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border-color/50 bg-accent/20 backdrop-blur-md">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-end h-full px-4">
          <div className="relative flex items-center space-x-4">
            <AskAiSearch />
            <div className="flex items-center space-x-2" title="Simulate network connection going online/offline">
              <span className={`text-xs font-semibold transition-colors ${isOnline ? 'text-accent' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={toggleNetworkStatus}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
                  isOnline ? 'bg-accent' : 'bg-border-color'
                }`}
                role="switch"
                aria-checked={isOnline}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
                    isOnline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {isSearchPanelOpen && <SearchPanel setActiveView={setActiveView} />}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

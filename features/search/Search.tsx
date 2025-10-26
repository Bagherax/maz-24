import React, { useState } from 'react';
import { SearchIcon as MagnifyingGlassIcon } from '../../components/icons/SearchIcon';
import { CameraIcon } from '../../components/icons/CameraIcon';
import * as api from '../../api';


const Search: React.FC = () => {
  const [searchMode, setSearchMode] = useState<'text' | 'semantic' | 'image'>('text');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setSearchResult(null);

    if (searchMode === 'semantic') {
        try {
            await api.getSearchVector(query);
            setSearchResult(`Generated semantic vector for "${query}". Ready for similarity search in a vector database.`);
        } catch (error) {
            setSearchResult('Failed to generate search vector.');
        }
    } else {
        // Placeholder for text and image search
        await new Promise(res => setTimeout(res, 500));
        setSearchResult(`Standard text search results for "${query}" would appear here.`);
    }

    setIsLoading(false);
  };

  const SearchModeButton: React.FC<{
    mode: 'text' | 'semantic' | 'image';
    label: string;
    children: React.ReactNode;
  }> = ({ mode, label, children }) => (
    <button
      onClick={() => setSearchMode(mode)}
      className={`px-4 py-2 text-sm font-medium rounded-full flex items-center transition-colors ${
        searchMode === mode
          ? 'bg-accent text-white'
          : 'bg-secondary text-text-secondary hover:bg-border-color'
      }`}
    >
      {children}
      <span className="ml-2">{label}</span>
    </button>
  );


  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Smart Search</h2>
      <div className="relative mb-4 flex items-center space-x-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for anything..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
            <MagnifyingGlassIcon />
          </div>
        </div>
        <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover disabled:bg-gray-500"
        >
            {isLoading ? '...' : 'Search'}
        </button>
      </div>

      <div className="flex items-center justify-center space-x-2 mb-6 p-1 bg-primary rounded-full">
         <SearchModeButton mode="text" label="Text">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
         </SearchModeButton>
         <SearchModeButton mode="semantic" label="Semantic">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10s5 2 8 -3.657z" /></svg>
         </SearchModeButton>
         <SearchModeButton mode="image" label="Image">
            <CameraIcon />
         </SearchModeButton>
      </div>

      <div className="mt-8 text-center text-text-secondary">
        {searchResult ? (
            <p className="text-sm text-green-400 bg-green-900/50 p-3 rounded-md">{searchResult}</p>
        ) : (
            <>
                <p>Search results will appear here.</p>
                <p className="text-sm mt-2">
                    {searchMode === 'text' && 'Powered by Elasticsearch for fast, relevant results.'}
                    {searchMode === 'semantic' && 'Semantic search (coming soon) understands context, not just keywords.'}
                    {searchMode === 'image' && 'Visual search (coming soon) lets you find products by image.'}
                </p>
                 <p className="text-xs text-text-secondary/70 mt-1">
                     (Powered by Vector DB)
                </p>
            </>
        )}
      </div>
    </div>
  );
};

export default Search;

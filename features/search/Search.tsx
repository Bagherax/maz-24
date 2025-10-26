import React, { useState } from 'react';
import { SearchIcon as MagnifyingGlassIcon } from '../../components/icons/SearchIcon';
import { CameraIcon } from '../../components/icons/CameraIcon';
import * as api from '../../api';
import { XMarkIcon } from '../../components/icons/XMarkIcon';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';


const Search: React.FC = () => {
  const [searchMode, setSearchMode] = useState<'text' | 'semantic' | 'image'>('text');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  
  // State for image search
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State for recent searches UI
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { searches: recentSearches, addSearch, clearSearches } = useRecentSearches();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setQuery(''); // Clear text query
      setSearchResult(null);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    setSearchResult(null);
    // Also reset the file input so the same file can be re-uploaded
    const input = document.getElementById('image-search-upload') as HTMLInputElement;
    if(input) input.value = '';
  };

  const handleSearch = async (searchQuery?: string) => {
    const queryToUse = searchQuery ?? query;
    setIsInputFocused(false); // Hide recent searches panel
    setIsLoading(true);
    setSearchResult(null);

    if (searchMode === 'image') {
        if (!imageFile) {
            setSearchResult('Please upload an image to search.');
            setIsLoading(false);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64Image = (reader.result as string).split(',')[1];
                const result = await api.generateAdFromImage(base64Image);
                const formattedResult = `AI Analysis Result:\n- Title: ${result.title}\n- Category: ${result.categoryPath.join(' > ')}\n- Condition: ${result.condition}\n- Suggested Price: $${result.suggestedPrice.toFixed(2)}`;
                setSearchResult(formattedResult);
            } catch (error) {
                setSearchResult('Failed to analyze image.');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(imageFile);
        return; // Return because FileReader is async
    }

    if (!queryToUse) {
        setIsLoading(false);
        return;
    }
    
    addSearch(queryToUse);
    
    if (searchMode === 'semantic') {
        try {
            await api.getSearchVector(queryToUse);
            setSearchResult(`Generated semantic vector for "${queryToUse}". Ready for similarity search in a vector database.`);
        } catch (error) {
            setSearchResult('Failed to generate search vector.');
        }
    } else { // 'text' mode
        await new Promise(res => setTimeout(res, 500));
        setSearchResult(`Standard text search results for "${queryToUse}" would appear here.`);
    }

    setIsLoading(false);
  };

  const SearchModeButton: React.FC<{
    mode: 'text' | 'semantic' | 'image';
    label: string;
    children: React.ReactNode;
  }> = ({ mode, label, children }) => (
    <button
      onClick={() => {
        setSearchMode(mode);
        setSearchResult(null);
      }}
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
      <div className="relative mb-4">
        <div className="flex items-center space-x-2">
            {searchMode !== 'image' && (
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsInputFocused(false), 200)} // Delay to allow clicks
                        placeholder="Search for anything..."
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                        <MagnifyingGlassIcon />
                    </div>
                </div>
            )}
            <button
                onClick={() => handleSearch()}
                disabled={isLoading || (searchMode !== 'image' && !query) || (searchMode === 'image' && !imageFile)}
                className="px-4 py-2 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover disabled:bg-gray-500"
            >
                {isLoading ? '...' : 'Search'}
            </button>
        </div>

        {isInputFocused && searchMode !== 'image' && !query && recentSearches.length > 0 && (
            <div className="absolute top-full w-full mt-2 bg-secondary border border-border-color rounded-lg shadow-xl z-20">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Recent Searches</h4>
                        <button onClick={clearSearches} className="flex items-center text-xs font-semibold text-text-secondary hover:text-red-500 transition-colors">
                            <TrashIcon />
                            <span className="ml-1">Clear</span>
                        </button>
                    </div>
                    <ul className="space-y-1">
                    {recentSearches.map((search, index) => (
                        <li key={index}>
                            <button
                                // Use onMouseDown to prevent the input's onBlur from firing first
                                onMouseDown={() => {
                                    setQuery(search);
                                    handleSearch(search);
                                }}
                                className="w-full text-left flex items-center p-2 rounded-md hover:bg-primary transition-colors"
                            >
                                <ClockIcon className="h-4 w-4 text-text-secondary mr-3 flex-shrink-0" />
                                <span className="text-sm text-text-primary truncate">{search}</span>
                            </button>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        )}
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
      
      {searchMode === 'image' && (
        <div className="mb-6">
            <label htmlFor="image-search-upload" className="relative cursor-pointer bg-secondary rounded-lg border-2 border-dashed border-border-color flex flex-col items-center justify-center h-48 p-6 hover:border-accent transition-colors">
                {imagePreview ? (
                    <>
                        <img src={imagePreview} alt="Search preview" className="max-h-full max-w-full object-contain rounded-md" />
                        <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 transition-opacity hover:bg-black/80">
                            <XMarkIcon className="h-4 w-4"/>
                        </button>
                    </>
                ) : (
                    <div className="text-center text-text-secondary">
                        <CameraIcon />
                        <span className="mt-2 block text-sm font-semibold text-text-primary">Upload an image</span>
                        <span className="mt-1 block text-xs">MAZ-AI will identify the item for you.</span>
                    </div>
                )}
            </label>
            <input id="image-search-upload" name="image-search-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
        </div>
      )}

      <div className="mt-8 text-center text-text-secondary">
        {searchResult ? (
            <p className="text-sm text-green-400 bg-green-900/50 p-3 rounded-md whitespace-pre-wrap">{searchResult}</p>
        ) : (
            <>
                <p>Search results will appear here.</p>
                <p className="text-sm mt-2">
                    {searchMode === 'text' && 'Powered by Elasticsearch for fast, relevant results.'}
                    {searchMode === 'semantic' && 'Semantic search (coming soon) understands context, not just keywords.'}
                    {searchMode === 'image' && 'Visual search uses on-device AI to find products by image.'}
                </p>
                 <p className="text-xs text-text-secondary/70 mt-1">
                     (Powered by MAZ-AI Engine)
                </p>
            </>
        )}
      </div>
    </div>
  );
};

export default Search;
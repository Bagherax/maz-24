import React from 'react';

const Search: React.FC = () => {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Search</h2>
      <div className="relative">
        <input
          type="text"
          placeholder="Search for anything..."
          className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="mt-8 text-center text-text-secondary">
        <p>Search results will appear here.</p>
        <p className="text-sm mt-2">Feature powered by Elasticsearch and Vector DB coming soon.</p>
      </div>
    </div>
  );
};

export default Search;

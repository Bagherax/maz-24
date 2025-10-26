import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 bg-secondary h-16 flex items-center justify-between px-4 border-b border-border-color">
      <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-accent to-accent-hover tracking-tight">MAZ</h1>
      {/* Additional header items like notifications could go here */}
    </header>
  );
};

export default Header;

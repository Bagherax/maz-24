import React from 'react';
import type { View } from '../../types';
import { VIEWS } from '../../constants/views';

import { HomeIcon } from '../icons/HomeIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { ChatIcon } from '../icons/ChatIcon';
import { UserIcon } from '../icons/UserIcon';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactElement;
  label: string;
  view: View;
  isActive: boolean;
  onClick: (view: View) => void;
}> = ({ icon, label, view, isActive, onClick }) => (
  <button
    onClick={() => onClick(view)}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
    }`}
    aria-label={label}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const { identity } = useAuth();
  
  const navItems = [
    {
      icon: <HomeIcon />,
      label: 'Home',
      view: VIEWS.MARKETPLACE,
    },
    {
      icon: <SearchIcon />,
      label: 'Search',
      view: VIEWS.SEARCH,
    },
    {
      icon: <PlusCircleIcon />,
      label: 'Post',
      view: VIEWS.CREATE_AD,
    },
    {
      icon: <ChatIcon />,
      label: 'Chat',
      view: VIEWS.CHAT,
    },
    {
      icon: <UserIcon />,
      label: 'Profile',
      view: VIEWS.PROFILE,
    },
  ];

  // The nav is only shown for full users, but this is a safeguard.
  if (identity?.type !== 'FULL_USER') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-secondary border-t border-border-color md:left-auto md:right-auto md:w-full md:max-w-md md:mx-auto">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <NavItem
            key={item.view}
            {...item}
            isActive={activeView === item.view}
            onClick={setActiveView}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
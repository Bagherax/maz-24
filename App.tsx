import React from 'react';
import type { View } from './types';
import { VIEWS } from './constants/views';
import BottomNav from './components/layout/BottomNav';
import Header from './components/layout/Header';
import Marketplace from './features/marketplace/Marketplace';
import Search from './features/search/Search';
import CreateAd from './features/create-ad/CreateAd';
import Chat from './features/chat/Chat';
import Profile from './features/profile/Profile';
import ManageListings from './features/manage-listings/ManageListings';
import { useAuth } from './context/AuthContext';
import NotificationContainer from './components/ui/NotificationContainer';
import AdminDashboard from './features/admin/AdminDashboard';
import ThemeEditor from './features/admin/ThemeEditor';
import LazyAuthModal from './features/auth/LazyAuthModal';
import AdDetailSheet from './features/marketplace/AdDetailSheet';
import MazdadyLogo from './components/ui/MazdadyLogo';
import CategoryEditor from './features/admin/CategoryEditor';
import SellerProfileSheet from './features/profile/SellerProfileSheet';
import AdvertisingManagement from './features/advertising/AdvertisingManagement';
import PromotionCenter from './features/marketplace/PromotionCenter';
import FloatingActionButton from './components/ui/FloatingActionButton';
import PromotionModal from './features/marketplace/PromotionModal';

const App: React.FC = () => {
  const [activeView, _setActiveView] = React.useState<View>(VIEWS.MARKETPLACE);
  const [viewPayload, setViewPayload] = React.useState<any>(null);
  const { identity, loading } = useAuth();
  const mainScrollRef = React.useRef<HTMLElement>(null);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollTimeoutRef = React.useRef<number | null>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = React.useState(false);
  
  const setActiveView = (view: View, payload?: any) => {
    // Scroll main content to top on view change for better UX
    if (mainScrollRef.current) {
        mainScrollRef.current.scrollTop = 0;
    }
    _setActiveView(view);
    setViewPayload(payload);
  };

  React.useEffect(() => {
    const mainEl = mainScrollRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
            setIsScrolling(false);
        }, 150); // User is considered "stopped" after 150ms of no scrolling
    };

    mainEl.addEventListener('scroll', handleScroll);

    return () => {
        mainEl.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
    };
  }, []);

  // Global navigation event listener to allow decoupled components to trigger view changes.
  React.useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
        const { view, payload } = event.detail;
        if (view) {
            setActiveView(view, payload);
        }
    };

    window.addEventListener('navigateTo', handleNavigation as EventListener);
    
    return () => {
        window.removeEventListener('navigateTo', handleNavigation as EventListener);
    };
  }, []); // Empty dependency array ensures this runs only once.


  const renderView = () => {
    switch (activeView) {
      case VIEWS.MARKETPLACE:
        return <Marketplace setActiveView={setActiveView} />;
      case VIEWS.SEARCH:
        return <Search />;
      case VIEWS.CREATE_AD:
        return <CreateAd setActiveView={setActiveView} />;
      case VIEWS.CHAT:
        return <Chat payload={viewPayload} />;
      case VIEWS.PROFILE:
        return <Profile setActiveView={setActiveView} />;
      case VIEWS.MANAGE_LISTINGS:
        // This view requires a full user, handled within the component
        return <ManageListings setActiveView={setActiveView} />;
      case VIEWS.ADMIN_DASHBOARD:
        // This view requires an admin, handled within the component
        return <AdminDashboard setActiveView={setActiveView} />;
      case VIEWS.THEME_EDITOR:
        // This view requires an admin, handled within the component
        return <ThemeEditor setActiveView={setActiveView} />;
      case VIEWS.CATEGORY_EDITOR:
        // This view requires an admin, handled within the component
        return <CategoryEditor setActiveView={setActiveView} />;
      case VIEWS.ADVERTISING_MANAGEMENT:
        return <AdvertisingManagement setActiveView={setActiveView} />;
      case VIEWS.PROMOTION_CENTER:
        return <PromotionCenter adId={viewPayload?.adId} setActiveView={setActiveView} />;
      default:
        return <Marketplace setActiveView={setActiveView} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-primary">
        <MazdadyLogo className="text-7xl mb-4 animate-pulse" />
        <p className="text-text-primary">Loading...</p>
      </div>
    );
  }
  
  const isSubView = [VIEWS.MANAGE_LISTINGS, VIEWS.ADMIN_DASHBOARD, VIEWS.THEME_EDITOR, VIEWS.CATEGORY_EDITOR, VIEWS.ADVERTISING_MANAGEMENT, VIEWS.PROMOTION_CENTER].includes(activeView);
  const showNav = identity?.type === 'FULL_USER' && !isSubView;
  const showFab = [VIEWS.MARKETPLACE].includes(activeView);

  return (
    <div className="h-screen w-screen flex flex-col bg-primary">
      <NotificationContainer />
      <LazyAuthModal />
      <AdDetailSheet />
      <SellerProfileSheet />
      <Header setActiveView={setActiveView} />
      <main ref={mainScrollRef} className="w-full max-w-5xl mx-auto flex-1 overflow-y-auto pt-16 pb-20 px-4">
        {renderView()}
      </main>
      {showNav && (
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
      )}
      {showFab && (
          <FloatingActionButton 
              isScrolling={isScrolling}
              onAddFreeAd={() => setActiveView(VIEWS.CREATE_AD)}
              onAddPaidAd={() => setIsPromotionModalOpen(true)}
              onAddSocialBooster={() => setIsPromotionModalOpen(true)}
          />
      )}
      {isPromotionModalOpen && <PromotionModal onClose={() => setIsPromotionModalOpen(false)} />}
    </div>
  );
};

export default App;

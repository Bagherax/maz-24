import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { NetworkProvider } from './context/NetworkContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdDetailProvider } from './context/AdDetailContext';
import { SearchProvider } from './context/SearchContext';
import { CategoryProvider } from './context/CategoryContext';
import { SellerProfileProvider } from './context/SellerProfileContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <NetworkProvider>
          <MarketplaceProvider>
            <ThemeProvider>
              <AdDetailProvider>
                <SellerProfileProvider>
                  <SearchProvider>
                    <CategoryProvider>
                      <App />
                    </CategoryProvider>
                  </SearchProvider>
                </SellerProfileProvider>
              </AdDetailProvider>
            </ThemeProvider>
          </MarketplaceProvider>
        </NetworkProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
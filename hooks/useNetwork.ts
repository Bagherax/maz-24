import { useContext } from 'react';
import { NetworkContext } from '../context/NetworkContext';

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
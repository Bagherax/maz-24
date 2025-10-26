import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import * as api from '../api';

export interface CategoryTree {
  [key: string]: CategoryTree;
}

interface CategoryContextType {
  categories: CategoryTree;
  loading: boolean;
  error: string | null;
  updateCategories: (newCategories: CategoryTree) => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<CategoryTree>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCategories = await api.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateCategories = async (newCategories: CategoryTree) => {
    try {
      await api.saveCategories(newCategories);
      await fetchCategories(); // Re-fetch to confirm changes
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save categories.';
      setError(message);
      throw err; // Re-throw for the component to handle
    }
  };

  const value = {
    categories,
    loading,
    error,
    updateCategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

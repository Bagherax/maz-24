import React, { useState } from 'react';
import { getCategoryIcon } from '../../constants/categories';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { XMarkIcon } from '../../components/icons/XMarkIcon';
import { useCategory } from '../../context/CategoryContext';

interface CategoryBrowserProps {
  onCategorySelect: (path: string[]) => void;
  onClose: () => void;
}

const CategoryBrowser: React.FC<CategoryBrowserProps> = ({ onCategorySelect, onClose }) => {
    const { categories: MAZDADY_CATEGORIES, loading } = useCategory();
    const [currentPath, setCurrentPath] = useState<string[]>([]);

    const navigateTo = (categoryName: string) => {
        setCurrentPath(prev => [...prev, categoryName]);
    };

    const navigateBack = () => {
        setCurrentPath(prev => prev.slice(0, -1));
    };

    let currentLevel: any = MAZDADY_CATEGORIES;
    for (const key of currentPath) {
        currentLevel = currentLevel[key];
    }
    const categories = currentLevel ? Object.keys(currentLevel) : [];

    const handleCategoryClick = (categoryName: string) => {
        const subcategories = currentLevel[categoryName] ? Object.keys(currentLevel[categoryName]) : [];
        if (subcategories.length > 0) {
            navigateTo(categoryName);
        } else {
            // This is a leaf node, trigger the search
            onCategorySelect([...currentPath, categoryName]);
        }
    };
    
    if (loading) {
        return <div className="p-4 text-center text-text-secondary">Loading categories...</div>;
    }

    return (
        <div className="relative h-full">
            <div className="sticky top-0 bg-secondary z-10 p-4 border-b border-border-color">
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                        {currentPath.length > 0 && (
                            <button
                                onClick={navigateBack}
                                className="p-1 rounded-full text-text-secondary hover:bg-primary transition-colors mr-2 flex-shrink-0"
                                aria-label="Go back to previous category"
                            >
                                <ChevronLeftIcon />
                            </button>
                        )}
                        <h3 className="text-sm font-bold text-text-primary truncate" title={currentPath.join(' > ')}>
                            {currentPath.length > 0 ? currentPath[currentPath.length - 1] : 'Browse Categories'}
                        </h3>
                    </div>
                     <button
                        onClick={onClose}
                        className="p-1 rounded-full text-text-secondary hover:bg-primary transition-colors ml-2 flex-shrink-0"
                        aria-label="Close category browser"
                    >
                        <XMarkIcon />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-2">
                {categories.map(categoryName => {
                    const icon = currentPath.length === 0 ? getCategoryIcon(categoryName) : null;
                    const hasSubcategories = currentLevel[categoryName] && Object.keys(currentLevel[categoryName]).length > 0;
                    
                    return (
                        <button 
                            key={categoryName}
                            onClick={() => handleCategoryClick(categoryName)}
                            className="w-full text-left p-3 flex items-center justify-between bg-primary rounded-lg border border-border-color hover:bg-border-color hover:border-accent transition-all duration-200 group"
                        >
                            <div className="flex items-center min-w-0">
                                {icon && <div className="w-6 h-6 mr-3 text-text-secondary group-hover:text-accent transition-colors flex-shrink-0">{icon}</div>}
                                <span className="text-sm font-semibold text-text-primary truncate">
                                    {categoryName}
                                </span>
                            </div>
                            {hasSubcategories && (
                                <div className="text-text-secondary ml-2 flex-shrink-0">
                                    <ChevronRightIcon />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default CategoryBrowser;
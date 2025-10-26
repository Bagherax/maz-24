import React, { useEffect, useState } from 'react';
import { useSearch } from '../../context/SearchContext';
import { useNotification } from '../../hooks/useNotification';
import type { View } from '../../types';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import CategoryBrowser from './CategoryBrowser';

interface SearchPanelProps {
    setActiveView: (view: View) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ setActiveView }) => {
    const {
        commandResult,
        loading,
        handleCommandAction,
        executeQuery,
        closeSearchPanel,
    } = useSearch();
    const { addNotification } = useNotification();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Animate in on mount
        const timer = setTimeout(() => setIsAnimating(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (commandResult) {
            if ('message' in commandResult && commandResult.message) {
                addNotification(commandResult.message, 'info');
            }
            handleCommandAction(commandResult, setActiveView);
        }
    }, [commandResult, handleCommandAction, setActiveView, addNotification]);

    const handleCategorySelect = (path: string[]) => {
        const query = `Show me items in ${path.join(' > ')}`;
        executeQuery(query);
    };

    const renderContent = () => {
        if (loading) {
             return (
                <div className="text-center text-text-secondary p-4 animate-pulse">
                    <SparklesIcon className="h-5 w-5 mx-auto text-accent"/>
                    <p className="mt-2 text-xs">MAZ-AI is thinking...</p>
                </div>
            );
        }
        if (commandResult) {
            switch (commandResult.type) {
                case 'text_response':
                    return <p className="text-sm text-text-primary whitespace-pre-wrap p-4 bg-primary rounded-lg">{commandResult.payload}</p>;
                case 'error':
                     return <p className="text-sm text-red-400 p-4 bg-red-900/50 rounded-lg">{commandResult.payload}</p>;
                default:
                    return null;
            }
        }
        
        return <CategoryBrowser onCategorySelect={handleCategorySelect} onClose={closeSearchPanel} />;
    };

    return (
        <div className={`search-panel ${isAnimating ? 'open' : ''}`}>
            {renderContent()}
        </div>
    );
};

export default SearchPanel;
import React, { useState, useEffect } from 'react';
import type { View } from '../../types';
import { useCategory, CategoryTree } from '../../context/CategoryContext';
import { VIEWS } from '../../constants/views';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { useNotification } from '../../hooks/useNotification';

interface CategoryEditorProps {
    setActiveView: (view: View) => void;
}

const CategoryNode: React.FC<{
    name: string;
    node: CategoryTree;
    path: string[];
    onAdd: (path: string[]) => void;
    onDelete: (path: string[]) => void;
}> = ({ name, node, path, onAdd, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const subcategories = Object.keys(node);

    return (
        <div className="ml-4 pl-4 border-l border-border-color">
            <div className="flex items-center justify-between group">
                <div className="flex items-center">
                    {subcategories.length > 0 && (
                         <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs mr-1">
                            {isExpanded ? '▼' : '►'}
                        </button>
                    )}
                    <span className="font-semibold text-text-primary">{name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                    <button onClick={() => onAdd(path)} className="text-xs text-accent font-semibold">Add Subcategory</button>
                    <button onClick={() => onDelete(path)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><TrashIcon /></button>
                </div>
            </div>
            {isExpanded && (
                 <div>
                    {subcategories.map(subName => (
                        <CategoryNode 
                            key={subName}
                            name={subName}
                            node={node[subName]}
                            path={[...path, subName]}
                            onAdd={onAdd}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const CategoryEditor: React.FC<CategoryEditorProps> = ({ setActiveView }) => {
    const { categories, loading: contextLoading, error, updateCategories } = useCategory();
    const [editedCategories, setEditedCategories] = useState<CategoryTree | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const { addNotification } = useNotification();
    
    useEffect(() => {
        if (categories) {
            // Create a deep copy for editing to avoid mutating context state directly
            setEditedCategories(JSON.parse(JSON.stringify(categories)));
        }
    }, [categories]);

    const handleAdd = (path: string[]) => {
        const newCategoryName = prompt("Enter the name for the new subcategory:");
        if (!newCategoryName || !newCategoryName.trim()) return;

        setEditedCategories(prev => {
            if (!prev) return null;
            const newCategories = JSON.parse(JSON.stringify(prev));
            let currentLevel = newCategories;
            for (const key of path) {
                currentLevel = currentLevel[key];
            }
            if (currentLevel[newCategoryName]) {
                alert('A category with this name already exists at this level.');
                return prev;
            }
            currentLevel[newCategoryName] = {};
            return newCategories;
        });
    };
    
    const handleDelete = (path: string[]) => {
        if (!confirm(`Are you sure you want to delete the category "${path[path.length - 1]}" and all its subcategories?`)) {
            return;
        }
        
        setEditedCategories(prev => {
            if (!prev) return null;
            const newCategories = JSON.parse(JSON.stringify(prev));
            let currentLevel = newCategories;
            const parentPath = path.slice(0, -1);
            const keyToDelete = path[path.length - 1];

            for (const key of parentPath) {
                currentLevel = currentLevel[key];
            }
            delete currentLevel[keyToDelete];
            return newCategories;
        });
    };
    
    const handlePublish = async () => {
        if (!editedCategories) return;
        setIsPublishing(true);
        try {
            await updateCategories(editedCategories);
            addNotification("Categories updated successfully!", 'success');
            setActiveView(VIEWS.ADMIN_DASHBOARD);
        } catch(err) {
            addNotification(err instanceof Error ? err.message : 'Failed to publish changes.', 'error');
        } finally {
            setIsPublishing(false);
        }
    };
    
    if (contextLoading || !editedCategories) {
        return <LoadingSpinner />;
    }

    return (
        <div className="py-4">
             <div className="flex items-center mb-6">
                <button onClick={() => setActiveView(VIEWS.ADMIN_DASHBOARD)} className="p-2 rounded-full hover:bg-secondary">
                    <ChevronLeftIcon />
                </button>
                <h2 className="text-2xl font-bold text-text-primary ml-2">Manage Categories</h2>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="bg-secondary p-4 rounded-lg border border-border-color min-h-[50vh]">
                <div className="space-y-2">
                     {Object.keys(editedCategories).map(catName => (
                        <CategoryNode 
                            key={catName}
                            name={catName}
                            node={editedCategories[catName]}
                            path={[catName]}
                            onAdd={handleAdd}
                            onDelete={handleDelete}
                        />
                     ))}
                </div>
            </div>
            
            <div className="mt-6">
                <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover disabled:bg-gray-500"
                >
                    {isPublishing ? 'Publishing...' : 'Publish Changes'}
                </button>
            </div>

        </div>
    );
};

export default CategoryEditor;

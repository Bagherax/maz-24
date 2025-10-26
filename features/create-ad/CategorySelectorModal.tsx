import React from 'react';
import Modal from '../../components/ui/Modal';
import CategoryBrowser from '../search/CategoryBrowser';

interface CategorySelectorModalProps {
    onClose: () => void;
    onSelect: (path: string[]) => void;
}

const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({ onClose, onSelect }) => {
    return (
        <Modal onClose={onClose} title="Select a Category">
           <div className="h-[60vh] -m-6">
                <CategoryBrowser onCategorySelect={onSelect} onClose={onClose} />
           </div>
        </Modal>
    )
};

export default CategorySelectorModal;

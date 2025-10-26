import React, { useState } from 'react';
import { PlusIcon } from '../icons/PlusIcon';
import { XMarkIcon } from '../icons/XMarkIcon';
import { PencilSquareIcon } from '../icons/PencilSquareIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { RocketIcon } from '../icons/RocketIcon';

interface FloatingActionButtonProps {
    isScrolling: boolean;
    onAddFreeAd: () => void;
    onAddPaidAd: () => void;
    onAddSocialBooster: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ isScrolling, onAddFreeAd, onAddPaidAd, onAddSocialBooster }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        if (isScrolling) return;
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const FabOption: React.FC<{
        label: string;
        icon: React.ReactElement;
        onClick: () => void;
    }> = ({ label, icon, onClick }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center p-3 text-left text-white rounded-lg transition-colors hover:bg-white/10"
            aria-label={label}
        >
            {icon}
            <span className="ml-3 font-semibold">{label}</span>
        </button>
    );

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleMenu} />}
            <div
                className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all duration-200 ${
                    isScrolling ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
            >
                {/* Menu */}
                <div
                    className={`absolute bottom-full mb-4 w-64 transition-all duration-300 ease-in-out origin-bottom ${
                        isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                >
                    <div className="bg-accent p-2 rounded-xl shadow-lg space-y-1">
                        <FabOption
                            label="Social Media Booster"
                            icon={<RocketIcon className="h-5 w-5" />}
                            onClick={() => handleOptionClick(onAddSocialBooster)}
                        />
                        <FabOption
                            label="Paid Ad"
                            icon={<CurrencyDollarIcon className="h-5 w-5" />}
                            onClick={() => handleOptionClick(onAddPaidAd)}
                        />
                        <FabOption
                            label="Free Ad"
                            icon={<PencilSquareIcon className="h-5 w-5" />}
                            onClick={() => handleOptionClick(onAddFreeAd)}
                        />
                    </div>
                </div>

                {/* Main Button */}
                <button
                    onClick={toggleMenu}
                    className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-110 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-label="Create Ad"
                >
                    <div className="relative w-7 h-7 flex items-center justify-center">
                        <PlusIcon className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'transform rotate-90 opacity-0' : 'transform rotate-0 opacity-100'}`} />
                        <XMarkIcon className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'transform rotate-0 opacity-100' : 'transform -rotate-90 opacity-0'}`} />
                    </div>
                </button>
            </div>
        </>
    );
};

export default FloatingActionButton;

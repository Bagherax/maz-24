import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-secondary rounded-lg shadow-xl border border-border-color w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-text-secondary hover:text-text-primary"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
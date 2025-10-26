import React from 'react';

export const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.871 14.735c-2.14-2.14-2.14-5.61 0-7.75 2.14-2.14 5.61-2.14 7.75 0M19.129 9.265c2.14 2.14 2.14 5.61 0 7.75-2.14 2.14-5.61 2.14-7.75 0M4.871 9.265L9.25 13.64m5.63-4.375L19.129 17" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

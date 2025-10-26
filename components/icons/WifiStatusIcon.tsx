import React from 'react';

interface WifiStatusIconProps {
    isOnline: boolean;
}

export const WifiStatusIcon: React.FC<WifiStatusIconProps> = ({ isOnline }) => (
    <div className={`h-5 w-5 transition-colors ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
        {isOnline ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.394 9.393a15.5 15.5 0 0121.212 0" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.394 9.393a15.5 15.5 0 0121.212 0M1 1l22 22" />
            </svg>
        )}
    </div>
);
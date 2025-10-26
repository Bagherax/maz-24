import React from 'react';

interface FlagProps {
  countryCode: string;
  className?: string;
}

const Flag: React.FC<FlagProps> = ({ countryCode, className }) => {
  if (!countryCode) return null;

  return (
    <img
      src={`https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`}
      alt={`${countryCode} flag`}
      className={className || 'w-6 h-6 rounded-full object-cover flex-shrink-0'}
      loading="lazy"
      onError={(e) => {
        // Hide image on error (e.g., invalid country code)
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};

export default Flag;

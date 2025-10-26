import React from 'react';

interface MazdadyLogoProps {
  className?: string;
}

const MazdadyLogo: React.FC<MazdadyLogoProps> = ({ className }) => {
  // A simple text logo. The parent component is responsible for text size (e.g., text-4xl).
  // We apply the core styling here.
  return (
    <span className={`font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-accent to-accent-hover ${className}`}>
      MAZ
    </span>
  );
};

export default MazdadyLogo;

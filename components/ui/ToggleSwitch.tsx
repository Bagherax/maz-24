import React, { useState } from 'react';

export const ToggleSwitch: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
        isEnabled ? 'bg-accent' : 'bg-border-color'
      }`}
      role="switch"
      aria-checked={isEnabled}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
          isEnabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};
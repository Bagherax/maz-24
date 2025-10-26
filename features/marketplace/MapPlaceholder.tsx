import React from 'react';
import { LocationPinIcon } from '../../components/icons/LocationPinIcon';

interface MapPlaceholderProps {
  location: string;
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ location }) => {
  return (
    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-secondary border border-border-color">
      <img
        src="https://static.vecteezy.com/system/resources/thumbnails/003/171/355/small/abstract-city-map-with-pins-and-gps-tracking-route-vector.jpg"
        alt="Map placeholder"
        className="w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-4">
        <LocationPinIcon />
        <p className="mt-2 text-center font-semibold text-white">Location Preview</p>
        <p className="text-center text-sm text-gray-200">{location}</p>
        <p className="mt-2 text-center text-xs text-gray-300">(Map functionality coming soon)</p>
      </div>
    </div>
  );
};

export default MapPlaceholder;

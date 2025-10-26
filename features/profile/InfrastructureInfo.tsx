import React from 'react';
import { HybridArchIcon } from '../../components/icons/HybridArchIcon';
import { MicroservicesIcon } from '../../components/icons/MicroservicesIcon';
import { ScalabilityIcon } from '../../components/icons/ScalabilityIcon';
import MazdadyLogo from '../../components/ui/MazdadyLogo';

const InfoItem: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 h-6 w-6 text-accent">{icon}</div>
    <div className="ml-4">
      <h4 className="font-semibold text-text-primary">{title}</h4>
      <p className="mt-1 text-xs text-text-secondary">{children}</p>
    </div>
  </div>
);

export const InfrastructureInfo: React.FC = () => {
  return (
    <div className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color">
      <div className="flex items-center mb-4">
        <MazdadyLogo className="text-3xl" />
        <h3 className="text-base font-bold text-text-primary ml-2">Smart Infrastructure</h3>
      </div>
      <div className="space-y-4">
        <InfoItem icon={<HybridArchIcon />} title="Hybrid Architecture">
          Combines on-device storage for privacy with your personal cloud for persistent access. You own your data.
        </InfoItem>
        <InfoItem icon={<MicroservicesIcon />} title="Microservices">
          Every feature (Chat, Auctions, AI) is an independent service, ensuring high performance and faster updates.
        </InfoItem>
        <InfoItem icon={<ScalabilityIcon />} title="Ready for Scale">
          Built on a horizontally scalable architecture (Kubernetes-ready) to ensure a smooth experience for millions of users.
        </InfoItem>
      </div>
    </div>
  );
};

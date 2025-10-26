import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-secondary p-4 rounded-lg border border-border-color flex items-center">
            <div className="p-3 rounded-full bg-accent/20 text-accent">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </div>
    );
};

export default KPICard;

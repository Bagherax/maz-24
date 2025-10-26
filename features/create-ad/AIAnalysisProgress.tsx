import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon';

const steps = [
    "Analyzing image content...",
    "Identifying product category...",
    "Determining item condition...",
    "Suggesting a smart price...",
    "Writing a compelling description...",
];

export const AIAnalysisProgress: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 600); // Animation speed for each step

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center p-8 bg-secondary rounded-lg border border-border-color mt-6">
            <h3 className="text-xl font-bold text-text-primary">MAZ-AI is building your draft...</h3>
            <div className="mt-6 space-y-3 text-left max-w-sm mx-auto">
                {steps.map((step, index) => (
                    <div key={index} className={`flex items-center transition-opacity duration-300 ${index <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                            {index < currentStep ? (
                                <CheckCircleIcon />
                            ) : (
                                <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></div>
                            )}
                        </div>
                        <span className="ml-3 text-text-secondary">{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

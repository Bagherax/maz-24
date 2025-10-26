import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon';

const steps = [
    "Analyzing share activity...",
    "Detecting genuine user interaction...",
    "Screening for automated bots...",
    "Verifying share authenticity...",
];

export const VerificationProgress: React.FC = () => {
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
        }, 750); // Slower speed to simulate a more complex process

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center p-8">
            <h3 className="text-xl font-bold text-text-primary">Verifying Share...</h3>
            <p className="text-sm text-text-secondary mt-2">This ensures fairness in the marketplace.</p>
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

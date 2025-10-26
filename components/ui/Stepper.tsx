import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
            {stepIdx < currentStep ? (
              // Completed step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-accent" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                </div>
              </>
            ) : stepIdx === currentStep ? (
              // Current step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-border-color" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent bg-primary" aria-current="step">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                </div>
                 <span className="absolute -bottom-6 text-xs font-semibold text-accent">{step}</span>
              </>
            ) : (
              // Upcoming step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-border-color" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border-color bg-primary">
                </div>
                <span className="absolute -bottom-6 text-xs text-text-secondary">{step}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;

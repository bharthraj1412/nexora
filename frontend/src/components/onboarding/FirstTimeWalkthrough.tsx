import { useState } from 'react';
import { FiFolder, FiFile, FiActivity } from 'react-icons/fi';

interface WalkthroughProps {
    onComplete: () => void;
}

const steps = [
    {
        id: 1,
        icon: FiFolder,
        title: 'Create a Folder',
        description: 'Folders help you organize different types of information. Like "Assignments", "Customers", or "Projects".',
        tip: 'Choose from ready-made templates or create your own!'
    },
    {
        id: 2,
        icon: FiFile,
        title: 'Add Items',
        description: 'Items are the actual data you want to track. Like a homework assignment, a customer detail, or a task.',
        tip: 'Just fill in a simple form - no technical knowledge needed!'
    },
    {
        id: 3,
        icon: FiActivity,
        title: 'Track Changes',
        description: 'Every change you make is automatically saved in History. You can see what you added, updated, or deleted.',
        tip: 'Never lose track of what happened in your folders!'
    }
];

export default function FirstTimeWalkthrough({ onComplete }: WalkthroughProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const step = steps[currentStep];
    const Icon = step.icon;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {steps.map((s, idx) => (
                            <div
                                key={s.id}
                                className={`h-2 rounded-full transition-all ${idx === currentStep
                                    ? 'w-8 bg-primary-600'
                                    : idx < currentStep
                                        ? 'w-2 bg-primary-400'
                                        : 'w-2 bg-gray-300 dark:bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Skip
                    </button>
                </div>

                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Step {step.id}: {step.title}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                        {step.description}
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            💡 <strong>Quick Tip:</strong> {step.tip}
                        </p>
                    </div>

                    <button
                        onClick={handleNext}
                        className="btn btn-primary w-full text-lg py-3"
                    >
                        {currentStep < steps.length - 1 ? 'Next →' : 'Get Started! 🚀'}
                    </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-b-2xl text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Step {currentStep + 1} of {steps.length}
                    </p>
                </div>
            </div>
        </div>
    );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
    hasSeenWalkthrough: boolean;
    completeWalkthrough: () => void;
    resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            hasSeenWalkthrough: false,
            completeWalkthrough: () => set({ hasSeenWalkthrough: true }),
            resetOnboarding: () => set({ hasSeenWalkthrough: false }),
        }),
        {
            name: 'nexora-onboarding',
        }
    )
);

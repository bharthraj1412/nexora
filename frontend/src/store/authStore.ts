import { create } from 'zustand';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    requestOTP: (email: string, purpose: string) => Promise<void>;
    verifyRegistrationOTP: (email: string, code: string, password: string, fullName: string) => Promise<void>;
    verifyLoginOTP: (email: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    login: async (email: string, password: string) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            set({ user: data.user, isAuthenticated: true });
            toast.success('Welcome back!');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Login failed';
            toast.error(message);
            throw error;
        }
    },

    requestOTP: async (email: string, purpose: string) => {
        try {
            const endpoint = purpose === 'registration'
                ? '/auth/register/request-otp'
                : '/auth/login/request-otp';
            await api.post(endpoint, { email, purpose });
            toast.success('Verification code sent to your email!');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Failed to send code';
            toast.error(message);
            throw error;
        }
    },

    verifyRegistrationOTP: async (email: string, code: string, password: string, fullName: string) => {
        try {
            const { data } = await api.post('/auth/register/verify', {
                email,
                code,
                password,
                full_name: fullName,
            });
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            set({ user: data.user, isAuthenticated: true });
            toast.success('Account created successfully!');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Verification failed';
            toast.error(message);
            throw error;
        }
    },

    verifyLoginOTP: async (email: string, code: string) => {
        try {
            const { data } = await api.post('/auth/login/verify-otp', { email, code });
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            set({ user: data.user, isAuthenticated: true });
            toast.success('Welcome back!');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Verification failed';
            toast.error(message);
            throw error;
        }
    },

    logout: async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                await api.post('/auth/logout', { refresh_token: refreshToken });
            }
        } catch (error) {
            // Ignore logout errors
        } finally {
            localStorage.clear();
            set({ user: null, isAuthenticated: false });
            toast.success('Logged out successfully');
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }

        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            localStorage.clear();
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));

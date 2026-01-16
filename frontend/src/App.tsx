import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OTPLoginPage from './pages/auth/OTPLoginPage';
import DashboardPage from './pages/DashboardPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import ActivityPage from './pages/ActivityPage';
import PricingPage from './pages/PricingPage';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
    const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
    const { isDark } = useThemeStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
            />
            <Route
                path="/register"
                element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
            />
            <Route
                path="/otp-login"
                element={!isAuthenticated ? <OTPLoginPage /> : <Navigate to="/dashboard" replace />}
            />

            <Route
                path="/"
                element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="folders" element={<CollectionsPage />} />
                <Route path="folders/:id" element={<CollectionDetailPage />} />
                <Route path="history" element={<ActivityPage />} />
                <Route path="pricing" element={<PricingPage />} />
                {/* Legacy routes for backwards compatibility */}
                <Route path="collections" element={<Navigate to="/folders" replace />} />
                <Route path="collections/:id" element={<CollectionDetailPage />} />
                <Route path="activity" element={<Navigate to="/history" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;

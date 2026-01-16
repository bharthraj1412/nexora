import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
    const [step, setStep] = useState<'email' | 'verify'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { requestOTP, verifyRegistrationOTP } = useAuthStore();
    const navigate = useNavigate();

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestOTP(email, 'registration');
            setStep('verify');
        } catch (error) {
            // Error handled in store
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await verifyRegistrationOTP(email, otp, password, fullName);
            navigate('/dashboard');
        } catch (error) {
            // Error handled in store
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl items-center justify-center mb-4 shadow-glow">
                        <span className="text-white font-bold text-3xl">N</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Create your account
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {step === 'email' ? 'Get started with NEXORA' : 'Verify your email'}
                    </p>
                </div>

                <div className="card p-8 space-y-6">
                    {step === 'email' ? (
                        <form onSubmit={handleRequestOTP} className="space-y-4">
                            <Input
                                type="text"
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                icon={<FiUser />}
                                required
                            />

                            <Input
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                icon={<FiMail />}
                                required
                            />

                            <Input
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<FiLock />}
                                required
                                minLength={8}
                            />

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Password must contain uppercase, lowercase, number, and special character
                            </div>

                            <Button type="submit" isLoading={loading} className="w-full">
                                Continue
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    We sent a verification code to
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">{email}</p>
                            </div>

                            <Input
                                type="text"
                                label="Verification Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                required
                                className="text-center text-2xl tracking-widest"
                            />

                            <Button type="submit" isLoading={loading} className="w-full">
                                Verify & Create Account
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep('email')}
                                className="w-full"
                            >
                                Back
                            </Button>
                        </form>
                    )}

                    <div className="text-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                        </span>
                        <Link
                            to="/login"
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

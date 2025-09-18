'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { login } from '@/services/api';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // 1. Call the login API endpoint
            const response = await login(formData.email, formData.password);
            console.log('Login response:', response);

            // 2. On success, save the authentication token to localStorage
            if (response.session?.access_token) {
                localStorage.setItem('authToken', response.session.access_token);
                setSuccessMessage('Login successful! Redirecting...');

                // 3. Redirect to the main 'create' page after a short delay
                setTimeout(() => {
                    window.location.href = '/create';
                }, 1000);
            } else {
                throw new Error("Login failed: No session token received.");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to log in. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement Google OAuth
            console.log('Google login');
        } catch {
            setError('Failed to sign in with Google. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard
            title="Welcome back"
            subtitle="Sign in to continue your learning journey"
        >
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <label htmlFor="remember" className="text-sm text-muted-foreground">
                                Remember me
                            </label>
                        </div>
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                        >
                            {error}
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-success-foreground bg-success/10 p-3 rounded-md">
                            {successMessage}
                        </motion.div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-11 text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <GoogleButton
                    onClick={handleGoogleLogin}
                    disabled={true}
                >
                    Continue with Google
                </GoogleButton>

                <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/auth/signup"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </AuthCard>
    );
}

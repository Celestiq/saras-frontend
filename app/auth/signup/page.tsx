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
import { signUp } from '@/services/api'; // Import the signUp function

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        name: '',
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
        if (successMessage) setSuccessMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // --- CHANGE START ---
            // Call the actual API function
            await signUp(formData.email, formData.password, formData.name);
            // On success, show a helpful message to the user.
            setSuccessMessage("Account created! Please check your email for a confirmation link.");
            // --- CHANGE END ---
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement Google OAuth
            console.log('Google signup');
        } catch {
            setError('Failed to sign up with Google. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard
            title="Create your account"
            subtitle="Start your learning journey today"
        >
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Full Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            required
                            className="h-11"
                        />
                    </div>

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
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    {/* Display error or success messages */}
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
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-success-foreground bg-success/10 p-3 rounded-md"
                        >
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
                                Creating account...
                            </>
                        ) : (
                            'Create account'
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
                    onClick={handleGoogleSignUp}
                    disabled={true}
                >
                    Continue with Google
                </GoogleButton>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        href="/auth/login"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </AuthCard>
    );
}
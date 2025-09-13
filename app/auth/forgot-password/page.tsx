'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthCard } from '@/components/auth/AuthCard';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // TODO: Implement actual forgot password logic
            console.log('Forgot password for:', email);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsSubmitted(true);
        } catch {
            setError('Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthCard
                title="Check your email"
                subtitle="We've sent you a password reset link"
            >
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="font-display text-lg font-semibold mb-2">Email sent!</h3>
                        <p className="text-muted-foreground text-sm">
                            We&apos;ve sent a password reset link to <strong>{email}</strong>
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Didn&apos;t receive the email? Check your spam folder or try again.
                        </p>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setIsSubmitted(false);
                                setEmail('');
                            }}
                        >
                            Try different email
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/auth/login"
                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Forgot your password?"
            subtitle="No worries, we'll send you reset instructions"
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="h-11"
                        />
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

                    <Button
                        type="submit"
                        className="w-full h-11 text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send reset link'
                        )}
                    </Button>
                </form>

                <div className="text-center">
                    <Link
                        href="/auth/login"
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to sign in
                    </Link>
                </div>
            </div>
        </AuthCard>
    );
}

'use client';

import { motion } from 'framer-motion';
import { Feather, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Feather className="w-8 h-8 text-primary" />
                            <span className="font-display text-2xl font-bold">Saras</span>
                        </div>
                        <CardTitle className="font-display text-2xl">Welcome to Saras</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Your personal AI-crafted learning companion
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Link href="/auth/signup" className="block">
                            <Button className="w-full h-12 text-base">
                                Create Account
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>

                        <Link href="/auth/login" className="block">
                            <Button variant="outline" className="w-full h-12 text-base">
                                Sign In
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>

                        <div className="text-center pt-4">
                            <Link
                                href="/"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                ← Back to home
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

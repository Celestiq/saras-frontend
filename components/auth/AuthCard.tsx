'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
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
                            <Image
                                src="/logo.png"
                                alt="Saras Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                            <span className="font-display text-2xl font-bold">Saras</span>
                        </div>
                        <CardTitle className="font-display text-2xl">{title}</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            {subtitle}
                        </p>
                    </CardHeader>

                    <CardContent>
                        {children}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

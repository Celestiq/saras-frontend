'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Quote {
    id: number;
    text: string;
}

interface QuoteDisplayProps {
    className?: string;
}

export function QuoteDisplay({ className = "" }: QuoteDisplayProps) {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load quotes from the JSON file
    useEffect(() => {
        const loadQuotes = async () => {
            try {
                const response = await fetch('/assets/quotes.json');
                const data = await response.json();
                setQuotes(data.quotes);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load quotes:', error);
                setIsLoading(false);
            }
        };

        loadQuotes();
    }, []);

    // Rotate quotes every 3 seconds
    useEffect(() => {
        if (quotes.length === 0) return;

        const interval = setInterval(() => {
            setCurrentQuoteIndex((prevIndex) =>
                // (prevIndex + 1) % quotes.length
                Math.floor(Math.random() * 101)
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [quotes.length]);

    if (isLoading) {
        return (
            <Card className={`h-full flex flex-col items-center justify-center text-center ${className}`}>
                <CardContent className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Loading inspiration...</p>
                </CardContent>
            </Card>
        );
    }

    if (quotes.length === 0) {
        return (
            <Card className={`h-full flex flex-col items-center justify-center text-center ${className}`}>
                <CardContent className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No quotes available</p>
                </CardContent>
            </Card>
        );
    }

    const currentQuote = quotes[currentQuoteIndex];

    return (
        <Card className={`h-full flex flex-col items-center justify-center text-center ${className}`}>
            <CardContent className="flex flex-col items-center justify-center h-full p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuote.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeInOut"
                        }}
                        className="max-w-2xl"
                    >
                        {/* <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="text-6xl text-primary/20 mb-6"
                        >
                            "
                        </motion.div> */}

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-sm sm:text-md font-medium text-foreground/60 leading-relaxed mb-6 italic"
                        >
                            {`"${currentQuote.text}"`}
                        </motion.p>

                        {/* <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className="text-6xl text-primary/20"
                        >
                            "
                        </motion.div> */}
                    </motion.div>
                </AnimatePresence>

                {/* Progress indicator
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="flex space-x-2 mt-8"
                >
                    {quotes.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentQuoteIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`}
                            animate={{
                                scale: index === currentQuoteIndex ? 1.2 : 1,
                                opacity: index === currentQuoteIndex ? 1 : 0.3
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    ))}
                </motion.div> */}
            </CardContent>
        </Card>
    );
}

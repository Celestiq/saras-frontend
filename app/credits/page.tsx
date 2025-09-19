// frontend/app/credits/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Download, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { purchaseCredits } from '@/services/api';
import { cashfreeCreditsPaymentService } from '@/services/cashfree-credits';
import { CreditsPaymentModal } from '@/components/payment/CreditsPaymentModal';

interface CreditPackage {
    id: string;
    credits: number;
    price: number;
    popular?: boolean;
}

const creditPackages: CreditPackage[] = [
    {
        id: 'basic',
        credits: 15,
        price: 9,
    },
    {
        id: 'premium',
        credits: 30,
        price: 15,
        popular: true,
    },
];

const perks = [
    {
        icon: Download,
        title: 'Downloads',
        description: 'You can download the books within minutes. No need to wait for newsletters.',
    },
    {
        icon: Zap,
        title: 'Cost Effective',
        description: 'It is much cheaper to generate books.',
    },
];

export default function CreditsPage() {
    const [selectedPackage, setSelectedPackage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPayPalLoading, setIsPayPalLoading] = useState(false);
    const [isCashfreeLoading, setIsCashfreeLoading] = useState(false);

    const handleSelectPackage = (packageId: string) => {
        setSelectedPackage(packageId);
        setError(null); // Clear any previous errors
    };

    const handleProceedToCheckout = () => {
        if (!selectedPackage) {
            setError('Please select a package to continue');
            return;
        }

        const packageData = creditPackages.find(pkg => pkg.id === selectedPackage);
        if (!packageData) {
            setError('Invalid package selected');
            return;
        }

        setError(null);
        setIsPaymentModalOpen(true);
    };

    const handlePayPalCheckout = async () => {
        if (!selectedPackage) return;

        const packageData = creditPackages.find(pkg => pkg.id === selectedPackage);
        if (!packageData) return;

        setIsPayPalLoading(true);
        setError(null);

        try {
            console.log('Initiating PayPal credit purchase:', {
                packageId: selectedPackage,
                credits: packageData.credits,
                price: packageData.price
            });

            const response = await purchaseCredits(
                selectedPackage,
                packageData.credits,
                packageData.price
            );

            console.log('PayPal credit purchase response:', response);

            if (response.approval_url) {
                // Redirect to PayPal for payment
                console.log('Redirecting to PayPal approval URL:', response.approval_url);
                window.location.href = response.approval_url;
                // Note: Don't reset loading state on success - user will be redirected
            } else {
                throw new Error('No approval URL received from server');
            }
        } catch (err) {
            console.error('PayPal credit purchase failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to initiate credit purchase. Please try again.');
            setIsPayPalLoading(false);
            // Only reset loading state on error so user can try again
        }
    };

    const handleCashfreeCheckout = async () => {
        if (!selectedPackage) return;

        const packageData = creditPackages.find(pkg => pkg.id === selectedPackage);
        if (!packageData) return;

        setIsCashfreeLoading(true);
        setError(null);

        try {
            console.log('Initiating Cashfree credit purchase:', {
                packageId: selectedPackage,
                credits: packageData.credits,
                price: packageData.price
            });

            const result = await cashfreeCreditsPaymentService.processCreditsPayment(
                selectedPackage,
                packageData.credits,
                packageData.price
            );

            console.log('Cashfree credit purchase result:', result);

            if (result.status === 'success') {
                // Store payment details in session storage for success page
                sessionStorage.setItem('credits_payment_type', 'cashfree');
                if (result.order?.id) {
                    sessionStorage.setItem('credits_order_id', result.order.id);
                    console.log('Stored credits order ID:', result.order.id);
                } else {
                    console.warn('No order ID in result:', result);
                }

                // Redirect to success page
                window.location.href = '/payment/success?gateway=cashfree&type=credits';
                // Note: Don't reset loading state on success - user will be redirected
            } else {
                throw new Error(result.message || 'Payment failed');
            }
        } catch (err) {
            console.error('Cashfree credit purchase failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to process payment. Please try again.');
            setIsCashfreeLoading(false);
            // Only reset loading state on error so user can try again
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Get More Credits</h1>
                        <p className="text-muted-foreground mt-1">
                            Purchase credits to generate books instantly and at a lower cost
                        </p>
                    </div>
                </div>

                {/* Perks Section */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Why Buy Credits?</h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {perks.map((perk, index) => (
                            <motion.div
                                key={perk.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full border-2 hover:border-primary/20 transition-colors">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-full bg-primary/10">
                                                <perk.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg mb-2">{perk.title}</h3>
                                                <p className="text-muted-foreground">{perk.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Choose Your Package</h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {creditPackages.map((pkg, index) => (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className={`relative h-full cursor-pointer transition-all duration-200 ${selectedPackage === pkg.id
                                        ? 'border-primary shadow-lg scale-105'
                                        : 'border-2 hover:border-primary/20'
                                        }`}
                                    onClick={() => handleSelectPackage(pkg.id)}
                                >
                                    {pkg.popular && (
                                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                                            Most Popular
                                        </Badge>
                                    )}

                                    <CardHeader className="text-center pb-4">
                                        <CardTitle className="text-2xl font-bold">
                                            {pkg.credits} Credits
                                        </CardTitle>
                                        <div className="text-4xl font-bold text-primary mt-2">
                                            ${pkg.price}
                                        </div>
                                        <p className="text-muted-foreground">
                                            ${(pkg.price / pkg.credits).toFixed(2)} per credit
                                        </p>
                                    </CardHeader>

                                    <CardContent className="pt-0">
                                        <Button
                                            className={`w-full ${selectedPackage === pkg.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectPackage(pkg.id);
                                            }}
                                        >
                                            {selectedPackage === pkg.id ? 'Selected' : 'Select'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Checkout Button */}
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Button
                            size="lg"
                            className="px-8 py-3 text-lg"
                            disabled={!selectedPackage || isPayPalLoading || isCashfreeLoading}
                            onClick={handleProceedToCheckout}
                        >
                            {(isPayPalLoading || isCashfreeLoading) ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Proceed to Checkout
                                </>
                            )}
                        </Button>
                        {!selectedPackage && !isPayPalLoading && !isCashfreeLoading && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Please select a package to continue
                            </p>
                        )}
                        {error && (
                            <p className="text-sm text-red-500 mt-2">
                                {error}
                            </p>
                        )}
                    </motion.div>
                </div>

                {/* Payment Method Modal */}
                <CreditsPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onPayPalCheckout={handlePayPalCheckout}
                    onCashfreeCheckout={handleCashfreeCheckout}
                    selectedPackage={selectedPackage ? creditPackages.find(pkg => pkg.id === selectedPackage) || null : null}
                    isLoading={isPayPalLoading || isCashfreeLoading}
                    isPayPalLoading={isPayPalLoading}
                    isCashfreeLoading={isCashfreeLoading}
                />
            </div>
        </div>
    );
}

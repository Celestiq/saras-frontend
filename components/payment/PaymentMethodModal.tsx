import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPayPalCheckout: () => void;
    onCashfreeCheckout: () => void;
    onCreditCheckout: () => void;
    userCredits: number;
    sufficientCredits: boolean;
    isCreditCheckoutLoading: boolean;
    cartTotal: number;
}

export function PaymentMethodModal({
    isOpen,
    onClose,
    onPayPalCheckout,
    onCashfreeCheckout,
    onCreditCheckout,
    userCredits,
    sufficientCredits,
    isCreditCheckoutLoading,
    cartTotal
}: PaymentMethodModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'cashfree' | 'credits' | null>(null);

    const handleMethodSelect = (method: 'paypal' | 'cashfree' | 'credits') => {
        setSelectedMethod(method);
    };

    const handleConfirmPayment = () => {
        if (selectedMethod === 'paypal') {
            onPayPalCheckout();
        } else if (selectedMethod === 'cashfree') {
            onCashfreeCheckout();
        } else if (selectedMethod === 'credits') {
            onCreditCheckout();
        }
        onClose();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative z-10 w-full max-w-md"
                    >
                        <Card className="w-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-xl font-semibold">Choose Payment Method</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center text-sm text-muted-foreground mb-4">
                                    Total: <span className="font-semibold text-foreground">{formatPrice(cartTotal)}</span>
                                </div>

                                <div className="space-y-3">
                                    {/* PayPal Option */}
                                    <div
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'paypal'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                                : 'border-border hover:border-blue-300'
                                            }`}
                                        onClick={() => handleMethodSelect('paypal')}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod === 'paypal'
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                                }`}>
                                                {selectedMethod === 'paypal' && (
                                                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                                )}
                                            </div>
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            <div className="flex-1">
                                                <div className="font-medium">PayPal</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Pay with PayPal account or credit card
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cashfree Option */}
                                    <div
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'cashfree'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                                : 'border-border hover:border-blue-300'
                                            }`}
                                        onClick={() => handleMethodSelect('cashfree')}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod === 'cashfree'
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                                }`}>
                                                {selectedMethod === 'cashfree' && (
                                                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                                )}
                                            </div>
                                            <CreditCard className="w-5 h-5 text-green-600" />
                                            <div className="flex-1">
                                                <div className="font-medium">Cashfree</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Pay with UPI, cards, net banking, and more
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Credits Option */}
                                    {sufficientCredits && (
                                        <div
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'credits'
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                                    : 'border-border hover:border-green-300'
                                                }`}
                                            onClick={() => handleMethodSelect('credits')}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod === 'credits'
                                                        ? 'border-green-500 bg-green-500'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {selectedMethod === 'credits' && (
                                                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                                    )}
                                                </div>
                                                <Zap className="w-5 h-5 text-green-600" />
                                                <div className="flex-1">
                                                    <div className="font-medium">Pay with Credits</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Use {userCredits} available credits
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirmPayment}
                                        disabled={!selectedMethod || (selectedMethod === 'credits' && isCreditCheckoutLoading)}
                                        className="flex-1"
                                    >
                                        {selectedMethod === 'credits' && isCreditCheckoutLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            `Pay with ${selectedMethod === 'paypal' ? 'PayPal' : selectedMethod === 'cashfree' ? 'Cashfree' : 'Credits'}`
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

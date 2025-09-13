'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, ShoppingCart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCancelledPage() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    const handleGoHome = () => {
        router.push('/');
    };

    const handleTryAgain = () => {
        router.push('/create');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-orange-800">Payment Cancelled</CardTitle>
                    <p className="text-muted-foreground">
                        Your payment was cancelled. No charges have been made to your account.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <ShoppingCart className="w-5 h-5 text-orange-600" />
                            <h3 className="font-semibold text-orange-800">Your cart is still waiting</h3>
                        </div>
                        <p className="text-sm text-orange-700">
                            Your items are still in your cart and ready for checkout whenever you&apos;re ready.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Need help?</h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                            <li>• Check your internet connection and try again</li>
                            <li>• Make sure you have sufficient funds in your PayPal account</li>
                            <li>• Contact support if you continue to experience issues</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={handleTryAgain} className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleGoBack} className="flex-1">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                            <Button variant="outline" onClick={handleGoHome} className="flex-1">
                                Go Home
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

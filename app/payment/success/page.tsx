'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayPalSubscription, capturePayPalOrder, getOrderById, captureCreditPurchase, verifyCashfreeCreditPurchase } from '@/services/api';
import { Loader2, CheckCircle, AlertTriangle, Clock, Package, CreditCard, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Status = 'processing' | 'success' | 'error';

interface OrderItem {
    id: string;
    book_id: string;
    subscription: boolean;
    unit_price: number;
    book: {
        generated_title: string;
    };
}

interface Order {
    id: string;
    user_id: string;
    status: string;
    total: number;
    time_to_send: string;
    payment_method?: string;
    created_at: string;
    items: OrderItem[];
}

function PaymentProcessor() {
    const [status, setStatus] = useState<Status>('processing');
    const [message, setMessage] = useState('Processing your payment...');
    const [order, setOrder] = useState<Order | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const processPayment = async () => {
            const paymentType = sessionStorage.getItem('paypal_payment_type');
            // const paymentType = 'order'; // Hardcoded for testing
            const subscriptionId = sessionStorage.getItem('paypal_subscription_id');
            const orderId = searchParams.get('token') || searchParams.get('order_id');
            // const orderId = "1234"; // Hardcoded for testing
            const creditsOrderId = sessionStorage.getItem('credits_order_id');
            const cashfreeOrderId = sessionStorage.getItem('cashfree_order_id');
            const isCreditPurchase = searchParams.get('type') === 'credits';
            const isCashfreePayment = searchParams.get('gateway') === 'cashfree';
            const isCashfreeCredits = isCreditPurchase && isCashfreePayment;

            console.log('Payment verification debug:', {
                creditsOrderId,
                cashfreeOrderId,
                isCreditPurchase,
                isCashfreePayment,
                isCashfreeCredits,
                orderId: searchParams.get('token') || searchParams.get('order_id')
            });

            // Clear session storage items after reading them
            sessionStorage.removeItem('paypal_payment_type');
            sessionStorage.removeItem('paypal_subscription_id');
            sessionStorage.removeItem('credits_order_id');
            sessionStorage.removeItem('cashfree_order_id');

            let finalOrderId = orderId || creditsOrderId;

            if (isCashfreeCredits && creditsOrderId) {
                // Handle Cashfree credit purchase
                try {
                    setMessage('Verifying your Cashfree credit purchase...');
                    const verificationResponse = await verifyCashfreeCreditPurchase(creditsOrderId);
                    setStatus('success');
                    setMessage(`Payment successful! ${verificationResponse.credits_added || 'Credits'} have been added to your account.`);

                    // For credit purchases, we don't need to fetch order details
                    return;
                } catch (error: unknown) {
                    setStatus('error');
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    setMessage(`Cashfree credit purchase verification failed: ${errorMessage}`);
                    return;
                }
            } else if (isCreditPurchase && orderId) {
                // Handle PayPal credit purchase
                try {
                    setMessage('Finalizing your credit purchase...');
                    const captureResponse = await captureCreditPurchase(orderId);
                    setStatus('success');
                    setMessage(`Payment successful! ${captureResponse.credits_added} credits have been added to your account.`);

                    // For credit purchases, we don't need to fetch order details
                    return;
                } catch (error: unknown) {
                    setStatus('error');
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    setMessage(`Credit purchase failed: ${errorMessage}`);
                    return;
                }
            } else if (paymentType === 'subscription' && subscriptionId) {
                try {
                    setMessage('Verifying your subscription...');
                    const subscriptionResponse = await verifyPayPalSubscription(subscriptionId);
                    setStatus('success');
                    setMessage('Your subscription is active! Your content generation will begin shortly.');

                    // Get order ID from the subscription response
                    if (subscriptionResponse.order && subscriptionResponse.order.id) {
                        finalOrderId = subscriptionResponse.order.id;
                    }
                } catch (error: unknown) {
                    setStatus('error');
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    setMessage(`Subscription verification failed: ${errorMessage}`);
                    return;
                }
            } else if (paymentType === 'order' && orderId) {
                try {
                    setMessage('Finalizing your payment...');
                    const captureResponse = await capturePayPalOrder(orderId);
                    setStatus('success');
                    setMessage('Payment successful! Your content generation will begin shortly.');

                    // Get order ID from the capture response
                    if (captureResponse.order && captureResponse.order.id) {
                        finalOrderId = captureResponse.order.id;
                    }
                } catch (error: unknown) {
                    setStatus('error');
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    setMessage(`Payment capture failed: ${errorMessage}`);
                    return;
                }
            } else if (isCashfreePayment && cashfreeOrderId) {
                // Cashfree payment - already verified during checkout
                setStatus('success');
                setMessage('Payment with Cashfree successful! Your content generation will begin shortly.');
                finalOrderId = cashfreeOrderId;
            } else if (creditsOrderId) {
                // Credits checkout - no payment processing needed
                setStatus('success');
                setMessage('Payment with credits successful! Your content generation will begin shortly.');
                finalOrderId = creditsOrderId;
            } else {
                setStatus('error');
                setMessage('Could not verify payment details. Please check your order history or contact support.');
                return;
            }

            // Fetch order details if we have an order ID
            if (finalOrderId) {
                try {
                    setMessage('Loading order details...');
                    const orderData = await getOrderById(finalOrderId);
                    setOrder(orderData);
                } catch (error: unknown) {
                    console.error('Failed to fetch order details:', error);
                    // Don't change status to error, just show without order details
                }
            }
        };

        processPayment();
    }, [searchParams, router]);

    const getStatusColor = (orderStatus: string) => {
        switch (orderStatus) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'generating': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (orderStatus: string) => {
        switch (orderStatus) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'generating': return <Package className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'failed': return <AlertTriangle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatTime = (timeString: string) => {
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return timeString;
        }
    };

    const renderIcon = () => {
        switch (status) {
            case 'processing': return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
            case 'success': return <CheckCircle className="h-16 w-16 text-green-500" />;
            case 'error': return <AlertTriangle className="h-16 w-16 text-red-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="mb-4">{renderIcon()}</div>
                <h1 className="text-3xl font-bold mb-2">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </h1>
                <p className="text-gray-600 text-lg">{message}</p>
            </div>

            {/* Order Summary */}
            {order && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Order Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Order Status</span>
                            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                        </div>

                        {/* Order ID */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Order ID</span>
                            <span className="text-sm font-mono">{order.id}</span>
                        </div>

                        {/* Payment Method */}
                        {order.payment_method && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Payment Method</span>
                                <span className="text-sm flex items-center gap-1">
                                    {order.payment_method.includes('paypal') ? (
                                        <CreditCard className="w-4 h-4" />
                                    ) : (
                                        <DollarSign className="w-4 h-4" />
                                    )}
                                    {order.payment_method === 'paypal' ? 'PayPal Subscription' :
                                        order.payment_method === 'paypal_onetime' ? 'PayPal One-time' :
                                            order.payment_method === 'credits' ? 'Credits' : order.payment_method}
                                </span>
                            </div>
                        )}

                        <hr className="border-gray-200" />

                        {/* Order Items */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div key={item.id || `item-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.book.generated_title}</p>
                                            <p className="text-sm text-gray-600">
                                                {item.subscription ? 'Subscription' : 'One-time purchase'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">${item.unit_price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Total */}
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                    onClick={() => router.push('/create')}
                    className="px-6 py-2"
                >
                    Back to Create
                </Button>
                <Button
                    onClick={() => router.push('/order-history')}
                    variant="outline"
                    className="px-6 py-2"
                >
                    View Order History
                </Button>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Suspense fallback={<Loader2 className="h-16 w-16 animate-spin" />}>
                <PaymentProcessor />
            </Suspense>
        </div>
    );
}
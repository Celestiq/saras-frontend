'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
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
    const [retryCount, setRetryCount] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();

    const hasProcessed = useRef(false);

    // Global deduplication key based on order ID and session
    const getDeduplicationKey = useCallback(() => {
        const orderId = searchParams.get('token') || searchParams.get('order_id') || sessionStorage.getItem('credits_order_id');
        const sessionId = sessionStorage.getItem('payment_session_id') || Date.now().toString();
        return `payment_processing_${orderId}_${sessionId}`;
    }, [searchParams]);

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    // Retry logic for fetching order with exponential backoff
    const fetchOrderWithRetry = useCallback(async (orderId: string, attempt = 1): Promise<Order | null> => {
        try {
            console.log(`Fetching order ${orderId}, attempt ${attempt}/${MAX_RETRIES}`);
            const orderData = await getOrderById(orderId);

            // Check if order is still in draft status and we haven't exceeded retries
            if (orderData.status === 'draft' && attempt < MAX_RETRIES) {
                console.log(`Order still in draft status, retrying in ${RETRY_DELAY * attempt}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                return fetchOrderWithRetry(orderId, attempt + 1);
            }

            return orderData;
        } catch (error: unknown) {
            console.error(`Failed to fetch order on attempt ${attempt}:`, error);

            if (attempt < MAX_RETRIES) {
                console.log(`Retrying order fetch in ${RETRY_DELAY * attempt}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                return fetchOrderWithRetry(orderId, attempt + 1);
            }

            throw error;
        }
    }, []);

    useEffect(() => {
        const processPayment = async () => {
            const paymentType = sessionStorage.getItem('paypal_payment_type');
            const subscriptionId = sessionStorage.getItem('paypal_subscription_id');
            const orderId = searchParams.get('token') || searchParams.get('order_id');
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

            // Check if this is a page refresh (no session storage data available)
            const isPageRefresh = !paymentType && !subscriptionId && !creditsOrderId && !cashfreeOrderId;

            // Clear session storage items after reading them (only if not a refresh)
            if (!isPageRefresh) {
                sessionStorage.removeItem('paypal_payment_type');
                sessionStorage.removeItem('paypal_subscription_id');
                sessionStorage.removeItem('credits_order_id');
                sessionStorage.removeItem('cashfree_order_id');
            }

            let finalOrderId = orderId || creditsOrderId;

            if (isPageRefresh && (orderId || (isCreditPurchase && isCashfreePayment))) {
                try {
                    setMessage('Loading your order details...');

                    if (isCreditPurchase && isCashfreePayment) {
                        // For Cashfree credits on refresh, we can't re-verify but we can show success
                        setStatus('success');
                        setMessage('Your credit purchase was completed successfully!');
                        return;
                    } else if (orderId) {
                        // For regular orders, fetch the order details with retry logic
                        const orderData = await fetchOrderWithRetry(orderId);
                        if (orderData) {
                            setOrder(orderData);
                            setStatus('success');
                            if (orderData.status === 'draft') {
                                setMessage('Payment completed successfully! Your order is being processed...');
                            } else {
                                setMessage('Payment completed successfully! Your order details have been updated.');
                            }
                        }
                        return;
                    }
                } catch (error: unknown) {
                    console.error('Failed to fetch order on refresh:', error);
                    // If we can't fetch order details, show a generic success message
                    setStatus('success');
                    setMessage('Your payment was processed successfully! Please check your order history for details.');
                    return;
                }
            }

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
            } else if (isPageRefresh) {
                // Page refresh with no identifiable payment information
                setStatus('success');
                setMessage('Your payment has been processed. Please check your order history for details.');
                return;
            } else {
                setStatus('error');
                setMessage('Could not verify payment details. Please check your order history or contact support.');
                return;
            }

            // Fetch order details if we have an order ID
            if (finalOrderId) {
                try {
                    setMessage('Loading order details...');
                    setRetryCount(0); // Reset retry count for new order fetch
                    const orderData = await fetchOrderWithRetry(finalOrderId);
                    if (orderData) {
                        setOrder(orderData);
                        if (orderData.status === 'draft') {
                            setMessage('Order is being processed. This may take a few moments...');
                        }
                    }
                } catch (error: unknown) {
                    console.error('Failed to fetch order details after retries:', error);
                    // Don't change status to error, just show without order details
                    setMessage('Order details are being processed. Please check your order history for updates.');
                }
            }
        };

        // Global deduplication check
        const deduplicationKey = getDeduplicationKey();
        const isAlreadyProcessing = localStorage.getItem(deduplicationKey);

        if (!hasProcessed.current && !isAlreadyProcessing) {
            hasProcessed.current = true; // Set the flag immediately
            localStorage.setItem(deduplicationKey, 'processing'); // Global lock

            processPayment().finally(() => {
                // Clear the global lock after processing (success or failure)
                localStorage.removeItem(deduplicationKey);
            });
        } else if (isAlreadyProcessing) {
            console.log('Payment processing already in progress in another tab/instance, skipping...');
            setStatus('success');
            setMessage('Payment processing is in progress. Please wait...');
        }
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
                    onClick={() => router.push('/manage-orders')}
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
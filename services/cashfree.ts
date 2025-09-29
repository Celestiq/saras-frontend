import { load } from "@cashfreepayments/cashfree-js";
import { API_PREFIX } from '../constants';

export interface CashfreePaymentSession {
    payment_type: string;
    order_id: string;
    payment_session_id: string;
    amount: number;
    currency: string;
}

export interface CashfreeVerificationResult {
    status: 'success' | 'pending' | 'failed';
    message: string;
    order?: any;
    payment_details?: any;
}

class CashfreePaymentService {
    private cashfree: any = null;
    private isInitialized = false;

    async initialize() {
        if (this.isInitialized && this.cashfree) {
            return this.cashfree;
        }

        try {
            this.cashfree = await load({
                mode: process.env.NODE_ENV === 'production' ? "production" : "sandbox"
            });
            this.isInitialized = true;
            console.log("Cashfree SDK initialized successfully");
            return this.cashfree;
        } catch (error) {
            console.error("Failed to initialize Cashfree SDK:", error);
            throw new Error("Failed to initialize payment system");
        }
    }

    async createPaymentSession(): Promise<CashfreePaymentSession> {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_PREFIX}/cashfree/create-payment-session`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to create payment session');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating payment session:', error);
            throw error;
        }
    }

    async processPayment(): Promise<CashfreeVerificationResult> {
        try {
            // Step 1: Initialize SDK
            await this.initialize();

            // Step 2: Create payment session
            const sessionData = await this.createPaymentSession();
            console.log('Payment session created:', sessionData);

            // Step 3: Open Cashfree checkout
            const checkoutOptions = {
                paymentSessionId: sessionData.payment_session_id,
                redirectTarget: "_modal" as const
            };

            const result = await this.cashfree.checkout(checkoutOptions);

            if (result.error) {
                console.log("Payment cancelled or error occurred:", result.error);
                return {
                    status: 'failed',
                    message: result.error.message || 'Payment was cancelled or failed'
                };
            }

            if (result.redirect) {
                console.log("Payment will be redirected");
                return {
                    status: 'failed',
                    message: 'Payment requires redirect, which is not supported in this flow'
                };
            }

            if (result.paymentDetails) {
                console.log("Payment completed:", result.paymentDetails);

                // Step 4: Verify payment on backend
                const verificationResult = await this.verifyPayment(sessionData.order_id);
                return verificationResult;
            }

            return {
                status: 'failed',
                message: 'Payment process completed without clear result'
            };

        } catch (error) {
            console.error('Payment processing error:', error);

            // Check if it's an API-related error
            const isApiError = error instanceof Error && (
                error.message.includes('Failed to create payment session') ||
                error.message.includes('Failed to verify payment') ||
                error.message.includes('Failed to initialize payment system') ||
                error.message.includes('Authentication token not found')
            );

            if (isApiError) {
                return {
                    status: 'failed',
                    message: 'We\'re experiencing technical difficulties with our payment system. Please contact our support team for assistance.'
                };
            }

            return {
                status: 'failed',
                message: error instanceof Error ? error.message : 'Payment processing failed'
            };
        }
    }

    async verifyPayment(orderId: string): Promise<CashfreeVerificationResult> {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_PREFIX}/cashfree/verify-payment/${orderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to verify payment');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    async checkOrderStatus(orderId: string) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_PREFIX}/cashfree/order-status/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to check order status');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking order status:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const cashfreePaymentService = new CashfreePaymentService();

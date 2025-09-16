import { load } from "@cashfreepayments/cashfree-js";

// const API_PREFIX = "https://0.0.0.0:8080";
const API_PREFIX = "https://api.mysaras.club";

export interface CashfreeCreditsPaymentSession {
    payment_type: string;
    order_id: string;
    payment_session_id: string;
    amount: number;
    currency: string;
    approval_url?: string;
}

export interface CashfreeCreditsVerificationResult {
    status: 'success' | 'pending' | 'failed';
    message: string;
    order?: any;
    payment_details?: any;
}

class CashfreeCreditsPaymentService {
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
            console.log("Cashfree SDK initialized successfully for credits");
            return this.cashfree;
        } catch (error) {
            console.error("Failed to initialize Cashfree SDK for credits:", error);
            throw new Error("Failed to initialize payment system");
        }
    }

    async createCreditsPaymentSession(packageId: string, credits: number, price: number): Promise<CashfreeCreditsPaymentSession> {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_PREFIX}/credits/purchase-cashfree`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    package_id: packageId,
                    credits: credits,
                    price: price
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to create credits payment session');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating credits payment session:', error);
            throw error;
        }
    }

    async processCreditsPayment(packageId: string, credits: number, price: number): Promise<CashfreeCreditsVerificationResult> {
        try {
            // Step 1: Initialize SDK
            await this.initialize();

            // Step 2: Create payment session
            const sessionData = await this.createCreditsPaymentSession(packageId, credits, price);
            console.log('Credits payment session created:', sessionData);

            // Step 3: Open Cashfree checkout
            const checkoutOptions = {
                paymentSessionId: sessionData.approval_url,
                redirectTarget: "_modal" as const
            };

            const result = await this.cashfree.checkout(checkoutOptions);

            if (result.error) {
                console.log("Credits payment cancelled or error occurred:", result.error);
                return {
                    status: 'failed',
                    message: result.error.message || 'Payment was cancelled or failed'
                };
            }

            if (result.redirect) {
                console.log("Credits payment will be redirected");
                return {
                    status: 'failed',
                    message: 'Payment requires redirect, which is not supported in this flow'
                };
            }

            if (result.paymentDetails) {
                console.log("Credits payment completed:", result.paymentDetails);

                // Step 4: Verify payment on backend
                const verificationResult = await this.verifyCreditsPayment(sessionData.order_id);

                // Ensure the order ID is included in the result
                return {
                    ...verificationResult,
                    order: {
                        id: sessionData.order_id,
                        ...verificationResult.order
                    }
                };
            }

            return {
                status: 'failed',
                message: 'Payment process completed without clear result'
            };

        } catch (error) {
            console.error('Credits payment processing error:', error);
            return {
                status: 'failed',
                message: error instanceof Error ? error.message : 'Payment processing failed'
            };
        }
    }

    async verifyCreditsPayment(orderId: string): Promise<CashfreeCreditsVerificationResult> {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_PREFIX}/credits/verify-cashfree-purchase/${orderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to verify credits payment');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error verifying credits payment:', error);
            throw error;
        }
    }

    async checkCreditsOrderStatus(orderId: string) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_PREFIX}/credits/order-status/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to check credits order status');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking credits order status:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const cashfreeCreditsPaymentService = new CashfreeCreditsPaymentService();

// frontend/services/api.ts
import { API_PREFIX } from '../constants';

// --- Authentication ---

function getAuthToken(): string | null {
    const token = localStorage.getItem('authToken');
    return token;
}

async function apiFetch(endpoint: string, options: RequestInit = {}, authenticated = true) {
    const headers = new Headers({ 'Content-Type': 'application/json' });

    if (authenticated) {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication token not found. Please log in.");
        }
        headers.append('Authorization', `Bearer ${token}`);
    }

    const config = {
        ...options,
        headers,
    };

    const url = `${API_PREFIX}${endpoint}`;
    console.log(`API Fetch: ${options.method || 'GET'} ${url}`, { authenticated, hasToken: !!getAuthToken() });

    let response;
    try {
        response = await fetch(url, config);
        console.log(`API Response: ${response.status} ${response.statusText} for ${url}`);
    } catch (error) {
        console.error(`API Fetch Error for ${url}:`, error);

        // Handle specific network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
        }

        throw error;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `An unknown server error occurred for endpoint ${endpoint}.` }));

        // Check if it's a payment-related endpoint and provide user-friendly error
        const isPaymentEndpoint = endpoint.includes('/cashfree/') ||
            endpoint.includes('/paypal/') ||
            endpoint.includes('/credits/') ||
            endpoint.includes('/cart/checkout');

        if (isPaymentEndpoint && response.status >= 500) {
            throw new Error('We\'re experiencing technical difficulties with our payment system. Please contact our support team for assistance.');
        }

        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const signUp = (email: string, password: string, name: string) => apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
}, false); // `authenticated` is false because the user isn't logged in yet.

/** Logs a user in. */
export const login = (email: string, password: string) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
}, false);


// --- Wish API ---

export const createWish = (topic: string) => apiFetch('/wishes', {
    method: 'POST',
    body: JSON.stringify({ topic }),
});

export const refineWish = (wishId: string, instructions: string) => apiFetch(`/wishes/${wishId}/refine`, {
    method: 'POST',
    body: JSON.stringify({ instructions }),
});


// --- Cart API ---

/** Fetches the entire cart object for the current user. */
export const getCart = () => apiFetch('/cart');

/** Adds a book to the cart. */
export const addItemToCart = (bookId: string, subscription: boolean) => apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ book_id: bookId, subscription }),
});

/** Updates an item's subscription status in the cart. */
export const updateCartItem = (bookId: string, subscription: boolean) => apiFetch(`/cart/items/${bookId}`, {
    method: 'PUT',
    body: JSON.stringify({ subscription }),
});

/** Removes an item from the cart. */
export const removeItemFromCart = (bookId: string) => apiFetch(`/cart/items/${bookId}`, {
    method: 'DELETE',
});

/** Processes the checkout. */
export const checkoutCart = (timeToSend: string) => apiFetch('/cart/checkout', {
    method: 'POST',
    body: JSON.stringify({ time_to_send: timeToSend }),
});

/** Processes checkout using credits. */
export const checkoutWithCredits = (timeToSend: string) => {
    return apiFetch('/cart/checkout/credits', {
        method: 'POST',
        body: JSON.stringify({ time_to_send: timeToSend }),
    });
};

/** Checks if user has sufficient credits for checkout. */
export const checkCredits = () => {
    return apiFetch('/cart/check-credits', {
        method: 'GET',
    });
};

export const getUserProfile = () => apiFetch('/users/me');

export const getOrderHistory = () => apiFetch('/orders');

export const getOrderById = (orderId: string) => apiFetch(`/orders/${orderId}`);

// --- Manage Orders API ---

/** Fetches user subscriptions and order history for the manage-orders page */
export const getManageOrders = () => apiFetch('/subscriptions');

/** Pauses a subscription */
export const pauseSubscription = (itemId: string) => apiFetch(`/subscriptions/pause`, {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId }),
});

/** Resumes a paused subscription */
export const resumeSubscription = (itemId: string) => apiFetch(`/subscriptions/resume`, {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId }),
});

/** Cancels a subscription */
export const cancelSubscription = (itemId: string) => apiFetch(`/subscriptions/cancel`, {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId }),
});

// --- PayPal API ---

/** Creates a PayPal payment session based on the current cart contents */
export const createPayPalPayment = () => apiFetch('/paypal/create-payment-session', {
    method: 'POST',
});

/** Verifies a PayPal subscription status */
export const verifyPayPalSubscription = (subscriptionId: string) => apiFetch(`/paypal/verify-subscription/${subscriptionId}`, {
    method: 'GET',
});

/** Captures a PayPal one-time order payment */
export const capturePayPalOrder = (orderId: string) => apiFetch(`/paypal/capture-order/${orderId}`, {
    method: 'POST',
});

/** Cancels a PayPal subscription */
export const cancelPayPalSubscription = (subscriptionId: string) => apiFetch(`/paypal/cancel-subscription/${subscriptionId}`, {
    method: 'POST',
});

// --- Credit Purchase API ---

/** Purchase credits using PayPal */
export const purchaseCredits = (packageId: string, credits: number, price: number) => apiFetch('/credits/purchase', {
    method: 'POST',
    body: JSON.stringify({ package_id: packageId, credits, price }),
});

/** Capture credit purchase payment */
export const captureCreditPurchase = (orderId: string) => apiFetch(`/credits/capture-purchase/${orderId}`, {
    method: 'POST',
});

/** Get current user's credit balance */
export const getCreditBalance = () => apiFetch('/credits/balance', {
    method: 'GET',
});

// --- Cashfree Credits Purchase API ---

/** Purchase credits using Cashfree */
export const purchaseCreditsWithCashfree = (packageId: string, credits: number, price: number) => apiFetch('/credits/purchase-cashfree', {
    method: 'POST',
    body: JSON.stringify({ package_id: packageId, credits, price }),
});

/** Verify Cashfree credit purchase payment */
export const verifyCashfreeCreditPurchase = (orderId: string) => apiFetch(`/credits/verify-cashfree-purchase/${orderId}`, {
    method: 'POST',
});
// frontend/services/api.ts

const API_PREFIX = "http://0.0.0.0:8080";
// const API_PREFIX = "https://api.mysaras.club";

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

    const response = await fetch(`${API_PREFIX}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `An unknown server error occurred for endpoint ${endpoint}.` }));
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
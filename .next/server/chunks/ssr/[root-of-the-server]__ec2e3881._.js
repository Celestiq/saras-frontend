module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/services/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/services/api.ts
// const API_PREFIX = "http://0.0.0.0:8080";
__turbopack_context__.s([
    "addItemToCart",
    ()=>addItemToCart,
    "cancelPayPalSubscription",
    ()=>cancelPayPalSubscription,
    "captureCreditPurchase",
    ()=>captureCreditPurchase,
    "capturePayPalOrder",
    ()=>capturePayPalOrder,
    "checkCredits",
    ()=>checkCredits,
    "checkoutCart",
    ()=>checkoutCart,
    "checkoutWithCredits",
    ()=>checkoutWithCredits,
    "createPayPalPayment",
    ()=>createPayPalPayment,
    "createWish",
    ()=>createWish,
    "getCart",
    ()=>getCart,
    "getCreditBalance",
    ()=>getCreditBalance,
    "getOrderById",
    ()=>getOrderById,
    "getOrderHistory",
    ()=>getOrderHistory,
    "getUserProfile",
    ()=>getUserProfile,
    "login",
    ()=>login,
    "purchaseCredits",
    ()=>purchaseCredits,
    "refineWish",
    ()=>refineWish,
    "removeItemFromCart",
    ()=>removeItemFromCart,
    "signUp",
    ()=>signUp,
    "updateCartItem",
    ()=>updateCartItem,
    "verifyPayPalSubscription",
    ()=>verifyPayPalSubscription
]);
const API_PREFIX = "https://api.mysaras.club";
// --- Authentication ---
function getAuthToken() {
    const token = localStorage.getItem('authToken');
    return token;
}
async function apiFetch(endpoint, options = {}, authenticated = true) {
    const headers = new Headers({
        'Content-Type': 'application/json'
    });
    if (authenticated) {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication token not found. Please log in.");
        }
        headers.append('Authorization', `Bearer ${token}`);
    }
    const config = {
        ...options,
        headers
    };
    const response = await fetch(`${API_PREFIX}${endpoint}`, config);
    console.log(`API Fetch to ${endpoint} with options: ${JSON.stringify(config)}\nResponse: `, response);
    if (!response.ok) {
        const errorData = await response.json().catch(()=>({
                detail: `An unknown server error occurred for endpoint ${endpoint}.`
            }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}
const signUp = (email, password, name)=>apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
            name
        })
    }, false); // `authenticated` is false because the user isn't logged in yet.
const login = (email, password)=>apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        })
    }, false);
const createWish = (topic)=>apiFetch('/wishes', {
        method: 'POST',
        body: JSON.stringify({
            topic
        })
    });
const refineWish = (wishId, instructions)=>apiFetch(`/wishes/${wishId}/refine`, {
        method: 'POST',
        body: JSON.stringify({
            instructions
        })
    });
const getCart = ()=>apiFetch('/cart');
const addItemToCart = (bookId, subscription)=>apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
            book_id: bookId,
            subscription
        })
    });
const updateCartItem = (bookId, subscription)=>apiFetch(`/cart/items/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify({
            subscription
        })
    });
const removeItemFromCart = (bookId)=>apiFetch(`/cart/items/${bookId}`, {
        method: 'DELETE'
    });
const checkoutCart = (timeToSend)=>apiFetch('/cart/checkout', {
        method: 'POST',
        body: JSON.stringify({
            time_to_send: timeToSend
        })
    });
const checkoutWithCredits = (timeToSend)=>{
    console.log(`[API] Starting credit checkout with time_to_send: ${timeToSend}`);
    console.log(`[API] Request body:`, JSON.stringify({
        time_to_send: timeToSend
    }));
    return apiFetch('/cart/checkout/credits', {
        method: 'POST',
        body: JSON.stringify({
            time_to_send: timeToSend
        })
    });
};
const checkCredits = ()=>{
    console.log('[API] Checking user credits for checkout');
    return apiFetch('/cart/check-credits', {
        method: 'GET'
    });
};
const getUserProfile = ()=>apiFetch('/users/me');
const getOrderHistory = ()=>apiFetch('/orders');
const getOrderById = (orderId)=>apiFetch(`/orders/${orderId}`);
const createPayPalPayment = ()=>apiFetch('/paypal/create-payment-session', {
        method: 'POST'
    });
const verifyPayPalSubscription = (subscriptionId)=>apiFetch(`/paypal/verify-subscription/${subscriptionId}`, {
        method: 'GET'
    });
const capturePayPalOrder = (orderId)=>apiFetch(`/paypal/capture-order/${orderId}`, {
        method: 'POST'
    });
const cancelPayPalSubscription = (subscriptionId)=>apiFetch(`/paypal/cancel-subscription/${subscriptionId}`, {
        method: 'POST'
    });
const purchaseCredits = (packageId, credits, price)=>apiFetch('/credits/purchase', {
        method: 'POST',
        body: JSON.stringify({
            package_id: packageId,
            credits,
            price
        })
    });
const captureCreditPurchase = (orderId)=>apiFetch(`/credits/capture-purchase/${orderId}`, {
        method: 'POST'
    });
const getCreditBalance = ()=>apiFetch('/credits/balance', {
        method: 'GET'
    });
}),
"[project]/context/CartContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/context/CartContext.tsx
__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-ssr] (ecmascript)");
;
;
;
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function CartProvider({ children }) {
    const [cart, setCart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Add this helper function at the top of the component
    const isTokenValid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((token)=>{
        try {
            // Basic JWT token validation - check if it's expired
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        } catch (error) {
            console.log('CartContext: Invalid token format');
            return false;
        }
    }, []);
    const fetchCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const token = localStorage.getItem('authToken');
        console.log('CartContext: Token check -', token ? 'Token exists' : 'No token');
        if (!token) {
            console.log('CartContext: No token, setting cart to null and stopping');
            setCart(null);
            setIsLoading(false);
            setError(null);
            return;
        }
        // Validate token before making API call
        if (!isTokenValid(token)) {
            console.log('CartContext: Token is invalid/expired, clearing it');
            localStorage.removeItem('authToken');
            setCart(null);
            setIsLoading(false);
            setError(null);
            return;
        }
        console.log('CartContext: Token is valid, attempting to fetch cart...');
        try {
            setError(null);
            setIsLoading(true);
            const cartData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCart"])();
            console.log("CartContext: Successfully fetched cart data:", cartData);
            setCart(cartData);
        } catch (err) {
            console.error("CartContext: Failed to fetch cart:", err);
            // Check for various authentication error patterns
            const isAuthError = err.message.includes('Authentication token not found') || err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('Invalid token') || err.message.includes('Token expired') || err.message.includes('JWT') || err.status === 401;
            if (isAuthError) {
                console.log('CartContext: Authentication error detected, clearing invalid token and cart');
                setCart(null);
                localStorage.removeItem('authToken'); // Clear invalid token
                setError(null); // Clear error since we've handled it
            } else {
                setError(err.message || 'Could not load cart data.');
            }
        } finally{
            setIsLoading(false);
        }
    }, [
        isTokenValid
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchCart();
    }, []);
    // --- Cart Actions ---
    const addItemToCart = async (bookId, title)=>{
        // Optimistic UI update
        const previousCart = cart;
        const newBook = {
            generated_title: title
        };
        const newItem = {
            book_id: bookId,
            book: newBook,
            subscription: true,
            unit_price: 1.00
        };
        if (cart) {
            setCart({
                ...cart,
                items: [
                    ...cart.items,
                    newItem
                ]
            });
        }
        try {
            const updatedCart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addItemToCart"])(bookId, true); // Default to subscription
            console.log("Cart after adding item:", updatedCart);
            setCart(updatedCart);
        } catch (err) {
            console.error("Failed to add item:", err);
            setError(err.message);
            setCart(previousCart); // Revert on failure
        }
    };
    const removeItemFromCart = async (bookId)=>{
        const previousCart = cart;
        if (cart) {
            setCart({
                ...cart,
                items: cart.items.filter((item)=>item.book_id !== bookId)
            });
        }
        try {
            const updatedCart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeItemFromCart"])(bookId);
            setCart(updatedCart);
        } catch (err) {
            console.error("Failed to remove item:", err);
            setError(err.message);
            setCart(previousCart); // Revert
        }
    };
    const updateItemSubscription = async (bookId, subscription)=>{
        const previousCart = cart;
        // Optimistic update for immediate UI feedback
        if (cart) {
            const newItems = cart.items.map((item)=>item.book_id === bookId ? {
                    ...item,
                    subscription
                } : item);
            setCart({
                ...cart,
                items: newItems
            });
        }
        try {
            const updatedCart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateCartItem"])(bookId, subscription);
            setCart(updatedCart);
        } catch (err) {
            console.error("Failed to update item:", err);
            setError(err.message);
            setCart(previousCart); // Revert
        }
    };
    const checkout = async ()=>{
        try {
            // In a real app, you'd get this from a time picker.
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkoutCart"])("07:00:00");
            // After checkout, the cart is no longer a 'draft', so we refetch.
            fetchCart();
            alert("Checkout successful! Your book is being generated.");
        } catch (err) {
            console.error("Checkout failed:", err);
            setError(err.message);
            alert(`Checkout failed: ${err.message}`);
        }
    };
    const checkoutWithCredits = async ()=>{
        console.log('[CART_CONTEXT] Starting credit checkout process');
        try {
            // In a real app, you'd get this from a time picker.
            console.log('[CART_CONTEXT] Calling API for credit checkout');
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkoutWithCredits"])("07:00:00");
            console.log('[CART_CONTEXT] Credit checkout successful, result:', result);
            // Store order ID in session storage for success page
            if (result.order && result.order.id) {
                sessionStorage.setItem('credits_order_id', result.order.id);
            }
            // After checkout, the cart is no longer a 'draft', so we refetch.
            fetchCart();
            // Redirect to success page instead of showing alert
            window.location.href = '/payment/success';
        } catch (err) {
            console.error("[CART_CONTEXT] Credit checkout failed - Full error object:", err);
            console.error("[CART_CONTEXT] Error message:", err.message);
            console.error("[CART_CONTEXT] Error status:", err.status);
            console.error("[CART_CONTEXT] Error response:", err.response);
            setError(err.message || 'Unknown error occurred');
            alert(`Credit checkout failed: ${err.message || 'Unknown error occurred'}`);
        }
    };
    const checkCredits = async ()=>{
        console.log('[CART_CONTEXT] Checking user credits');
        try {
            const creditInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkCredits"])();
            console.log('[CART_CONTEXT] Credit check result:', creditInfo);
            return creditInfo;
        } catch (err) {
            console.error("[CART_CONTEXT] Failed to check credits:", err);
            setError(err.message);
            throw err;
        }
    };
    const checkoutWithPayPal = async ()=>{
        try {
            // The backend now decides the payment type (subscription or one-time order)
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPayPalPayment"])();
            const approvalUrl = response.approval_url;
            if (!approvalUrl) {
                throw new Error("No approval URL received from PayPal");
            }
            // Store payment details in session storage to use on the success page
            if (response.payment_type === 'subscription') {
                sessionStorage.setItem('paypal_payment_type', 'subscription');
                sessionStorage.setItem('paypal_subscription_id', response.subscription_id);
            } else if (response.payment_type === 'order') {
                sessionStorage.setItem('paypal_payment_type', 'order');
                // Note: The order ID is stored in session storage but also comes back
                // in the URL from PayPal as the 'token' parameter.
                sessionStorage.setItem('paypal_order_id', response.order_id);
            }
            return approvalUrl;
        } catch (err) {
            console.error("PayPal checkout failed:", err);
            setError(err.message);
            throw err;
        }
    };
    // --- Derived State & Helpers ---
    const isItemInCart = (bookId)=>{
        return cart?.items.some((item)=>item.book_id === bookId) ?? false;
    };
    const getCartCount = ()=>cart?.items.length ?? 0;
    const value = {
        cart,
        isLoading,
        error,
        addItemToCart,
        removeItemFromCart,
        updateItemSubscription,
        checkout,
        checkoutWithCredits,
        checkoutWithPayPal,
        checkCredits,
        isItemInCart,
        getCartCount
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CartContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/context/CartContext.tsx",
        lineNumber: 287,
        columnNumber: 10
    }, this);
}
function useCart() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
}),
"[project]/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/app/providers.tsx
__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$CartContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/CartContext.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$CartContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ec2e3881._.js.map
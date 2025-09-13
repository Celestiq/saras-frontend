(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/services/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
async function apiFetch(endpoint) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, authenticated = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
    const headers = new Headers({
        'Content-Type': 'application/json'
    });
    if (authenticated) {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication token not found. Please log in.");
        }
        headers.append('Authorization', "Bearer ".concat(token));
    }
    const config = {
        ...options,
        headers
    };
    const response = await fetch("".concat(API_PREFIX).concat(endpoint), config);
    console.log("API Fetch to ".concat(endpoint, " with options: ").concat(JSON.stringify(config), "\nResponse: "), response);
    if (!response.ok) {
        const errorData = await response.json().catch(()=>({
                detail: "An unknown server error occurred for endpoint ".concat(endpoint, ".")
            }));
        throw new Error(errorData.detail || "HTTP error! status: ".concat(response.status));
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
const refineWish = (wishId, instructions)=>apiFetch("/wishes/".concat(wishId, "/refine"), {
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
const updateCartItem = (bookId, subscription)=>apiFetch("/cart/items/".concat(bookId), {
        method: 'PUT',
        body: JSON.stringify({
            subscription
        })
    });
const removeItemFromCart = (bookId)=>apiFetch("/cart/items/".concat(bookId), {
        method: 'DELETE'
    });
const checkoutCart = (timeToSend)=>apiFetch('/cart/checkout', {
        method: 'POST',
        body: JSON.stringify({
            time_to_send: timeToSend
        })
    });
const checkoutWithCredits = (timeToSend)=>{
    console.log("[API] Starting credit checkout with time_to_send: ".concat(timeToSend));
    console.log("[API] Request body:", JSON.stringify({
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
const getOrderById = (orderId)=>apiFetch("/orders/".concat(orderId));
const createPayPalPayment = ()=>apiFetch('/paypal/create-payment-session', {
        method: 'POST'
    });
const verifyPayPalSubscription = (subscriptionId)=>apiFetch("/paypal/verify-subscription/".concat(subscriptionId), {
        method: 'GET'
    });
const capturePayPalOrder = (orderId)=>apiFetch("/paypal/capture-order/".concat(orderId), {
        method: 'POST'
    });
const cancelPayPalSubscription = (subscriptionId)=>apiFetch("/paypal/cancel-subscription/".concat(subscriptionId), {
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
const captureCreditPurchase = (orderId)=>apiFetch("/credits/capture-purchase/".concat(orderId), {
        method: 'POST'
    });
const getCreditBalance = ()=>apiFetch('/credits/balance', {
        method: 'GET'
    });
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/context/CartContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/context/CartContext.tsx
__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function CartProvider(param) {
    let { children } = param;
    _s();
    const [cart, setCart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Add this helper function at the top of the component
    const isTokenValid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CartProvider.useCallback[isTokenValid]": (token)=>{
            try {
                // Basic JWT token validation - check if it's expired
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                return payload.exp > currentTime;
            } catch (error) {
                console.log('CartContext: Invalid token format');
                return false;
            }
        }
    }["CartProvider.useCallback[isTokenValid]"], []);
    const fetchCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CartProvider.useCallback[fetchCart]": async ()=>{
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
                const cartData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCart"])();
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
        }
    }["CartProvider.useCallback[fetchCart]"], [
        isTokenValid
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CartProvider.useEffect": ()=>{
            fetchCart();
        }
    }["CartProvider.useEffect"], []);
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
            const updatedCart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addItemToCart"])(bookId, true); // Default to subscription
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
            const updatedCart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeItemFromCart"])(bookId);
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
            const updatedCart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateCartItem"])(bookId, subscription);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkoutCart"])("07:00:00");
            // After checkout, the cart is no longer a 'draft', so we refetch.
            fetchCart();
            alert("Checkout successful! Your book is being generated.");
        } catch (err) {
            console.error("Checkout failed:", err);
            setError(err.message);
            alert("Checkout failed: ".concat(err.message));
        }
    };
    const checkoutWithCredits = async ()=>{
        console.log('[CART_CONTEXT] Starting credit checkout process');
        try {
            // In a real app, you'd get this from a time picker.
            console.log('[CART_CONTEXT] Calling API for credit checkout');
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkoutWithCredits"])("07:00:00");
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
            alert("Credit checkout failed: ".concat(err.message || 'Unknown error occurred'));
        }
    };
    const checkCredits = async ()=>{
        console.log('[CART_CONTEXT] Checking user credits');
        try {
            const creditInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkCredits"])();
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
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPayPalPayment"])();
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
        var _cart_items_some;
        return (_cart_items_some = cart === null || cart === void 0 ? void 0 : cart.items.some((item)=>item.book_id === bookId)) !== null && _cart_items_some !== void 0 ? _cart_items_some : false;
    };
    const getCartCount = ()=>{
        var _cart_items_length;
        return (_cart_items_length = cart === null || cart === void 0 ? void 0 : cart.items.length) !== null && _cart_items_length !== void 0 ? _cart_items_length : 0;
    };
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CartContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/context/CartContext.tsx",
        lineNumber: 287,
        columnNumber: 10
    }, this);
}
_s(CartProvider, "hsMthZs7O5Czwo8COBvFVxARXW0=");
_c = CartProvider;
function useCart() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
_s1(useCart, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "CartProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/app/providers.tsx
__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/CartContext.tsx [app-client] (ecmascript)");
'use client';
;
;
function Providers(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        "object" === typeof node && null !== node && node.$$typeof === REACT_ELEMENT_TYPE && node._store && (node._store.validated = 1);
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_9dee5275._.js.map
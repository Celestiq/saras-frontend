// frontend/context/CartContext.tsx
import { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import {
  getCart,
  addItemToCart as apiAddItemToCart,
  removeItemFromCart as apiRemoveItemFromCart,
  updateCartItem as apiUpdateCartItem,
  checkoutCart as apiCheckoutCart,
  checkoutWithCredits as apiCheckoutWithCredits,
  checkCredits as apiCheckCredits,
  createPayPalPayment
} from '@/services/api';
import { cashfreePaymentService, CashfreeVerificationResult } from '@/services/cashfree';
import { PRICE_ONE_TIME, PRICE_SUBSCRIPTION } from '../constants';

// --- TYPE DEFINITIONS (Matching Backend) ---
export interface Book {
  generated_title: string;
}

export interface Topic {
  title: string;
  context: string;
}

export interface Module {
  module_title: string;
  topics: Topic[];
}

export interface Plan {
  plan_id: string;
  modules: Module[];
  subject: string;
  book_id: string;
}

export interface CartItem {
  book_id: string;
  subscription: boolean;
  book: Book;
  unit_price: number;
}

export interface CartState {
  id: string; // Order ID
  user_id: string;
  status: 'draft' | 'pending' | 'complete' | 'failed';
  total: number;
  items: CartItem[];
}

export interface CartContextType {
  cart: CartState | null;
  isLoading: boolean;
  error: string | null;
  userCredits: number;
  isCheckingOut: boolean;
  addItemToCart: (bookId: string, title: string) => Promise<void>;
  removeItemFromCart: (bookId: string) => Promise<void>;
  updateItemSubscription: (bookId: string, subscription: boolean) => Promise<void>;
  checkout: () => Promise<void>;
  checkoutWithCredits: () => Promise<CartState>;
  checkoutWithPayPal: () => Promise<string>;
  checkoutWithCashfree: () => Promise<CashfreeVerificationResult>;
  checkCredits: () => Promise<{ cart_total: number, user_credits: number, sufficient_credits: boolean, has_profile: boolean }>;
  isItemInCart: (bookId: string) => boolean;
  getCartCount: () => number;
  setCart: React.Dispatch<React.SetStateAction<CartState | null>>;
  fetchCredits: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [isFetchingCart, setIsFetchingCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const fetchCartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchCartPromiseRef = useRef<Promise<void> | null>(null);
  const checkoutLockRef = useRef<boolean>(false);
  const cartClearedRef = useRef<boolean>(false);

  // Add this helper function at the top of the component
  const isTokenValid = useCallback((token: string): boolean => {
    try {
      // Basic JWT token validation - check if it's expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }, []);

  // Separate function to fetch only credits when needed
  const fetchCredits = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !isTokenValid(token)) {
      setUserCredits(0);
      return;
    }

    try {
      const creditInfo = await apiCheckCredits();
      setUserCredits(creditInfo.user_credits || 0);
    } catch (err: any) {
      console.error("Failed to fetch credits:", err);
      // Don't update credits on error - keep current value
    }
  }, [isTokenValid]);

  const fetchCart = useCallback(async (force = false) => {
    // If checkout is in progress and cart was already cleared, don't fetch unless forced
    if (isCheckingOut && cartClearedRef.current && !force) {
      console.log('fetchCart skipped: checkout in progress and cart already cleared');
      return;
    }

    // If there's already a fetchCart in progress, return the existing promise
    if (fetchCartPromiseRef.current && !force) {
      console.log('fetchCart already in progress, returning existing promise...');
      return fetchCartPromiseRef.current;
    }

    // Prevent multiple concurrent fetchCart calls with state check as backup
    if (isFetchingCart && !force) {
      console.log('fetchCart already in progress (state check), skipping...');
      return;
    }

    const token = localStorage.getItem('authToken');

    if (!token) {
      setCart(null);
      setUserCredits(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Validate token before making API call
    if (!isTokenValid(token)) {
      localStorage.removeItem('authToken');
      setCart(null);
      setUserCredits(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Create and store the fetch promise
    const fetchPromise = (async () => {
      setIsFetchingCart(true);

      try {
        setError(null);
        setIsLoading(true);

        // Only fetch cart data - credits will be fetched separately when needed
        const cartData = await getCart();

        // If checkout was completed and cart was cleared, don't override the cleared state
        if (cartClearedRef.current && (!cartData || cartData.items.length === 0)) {
          console.log('Cart fetch confirmed empty cart after checkout');
          setCart(null);
          cartClearedRef.current = false; // Reset the flag
        } else if (!cartClearedRef.current) {
          setCart(cartData);
        }
      } catch (err: any) {
        console.error("Failed to fetch cart:", err);

        // Check for various authentication error patterns
        const isAuthError = err.message.includes('Authentication token not found') ||
          err.message.includes('401') ||
          err.message.includes('Unauthorized') ||
          err.message.includes('Invalid token') ||
          err.message.includes('Token expired') ||
          err.message.includes('JWT') ||
          err.status === 401;

        if (isAuthError) {
          setCart(null);
          setUserCredits(0);
          localStorage.removeItem('authToken'); // Clear invalid token
          setError(null); // Clear error since we've handled it
        } else {
          setError(err.message || 'Could not load cart data.');
        }
      } finally {
        setIsLoading(false);
        setIsFetchingCart(false);
        fetchCartPromiseRef.current = null; // Clear the promise reference
      }
    })();

    // Store the promise reference
    fetchCartPromiseRef.current = fetchPromise;

    return fetchPromise;
  }, [isTokenValid, isCheckingOut]);

  useEffect(() => {
    // Fetch both cart and credits on initial load
    fetchCart();
    fetchCredits();

    // Cleanup timeout and promise reference on unmount
    return () => {
      if (fetchCartTimeoutRef.current) {
        clearTimeout(fetchCartTimeoutRef.current);
      }
      fetchCartPromiseRef.current = null;
      checkoutLockRef.current = false;
      cartClearedRef.current = false;
    };
  }, [fetchCart, fetchCredits]);

  // --- Cart Actions ---
  const addItemToCart = async (bookId: string, title: string) => {
    // Optimistic UI update
    const previousCart = cart;
    const newBook = { generated_title: title };
    const newItem: CartItem = {
      book_id: bookId,
      book: newBook,
      subscription: true,
      unit_price: 2.00
    };

    // Create the optimistic cart update
    const optimisticCart = cart ? { ...cart, items: [...cart.items, newItem] } : null;
    if (optimisticCart) {
      setCart(optimisticCart);
    }

    try {
      const updatedCart = await apiAddItemToCart(bookId, true); // Default to subscription
      setCart(updatedCart);
    } catch (err: any) {
      console.error("Failed to add item:", err);
      setError(err.message);
      setCart(previousCart); // Revert on failure
    }
  };

  const removeItemFromCart = async (bookId: string) => {
    const previousCart = cart;
    if (cart) {
      setCart({ ...cart, items: cart.items.filter(item => item.book_id !== bookId) });
    }

    try {
      const updatedCart = await apiRemoveItemFromCart(bookId);
      setCart(updatedCart);
    } catch (err: any) {
      console.error("Failed to remove item:", err);
      setError(err.message);
      setCart(previousCart); // Revert
    }
  };

  const updateItemSubscription = async (bookId: string, subscription: boolean) => {
    const previousCart = cart;
    if (!cart) return;

    // --- Start of Optimistic Update ---
    // 1. Calculate the new price and items list immediately
    const newItems = cart.items.map(item => {
      if (item.book_id === bookId) {
        return {
          ...item,
          subscription: subscription,
          unit_price: subscription ? PRICE_SUBSCRIPTION : PRICE_ONE_TIME,
        };
      }
      return item;
    });

    // 2. Recalculate the total based on the new items list
    const newTotal = newItems.reduce((acc, item) => acc + item.unit_price, 0);

    // 3. Set the new, complete state on the frontend instantly
    setCart({
      ...cart,
      items: newItems,
      total: newTotal,
    });
    // --- End of Optimistic Update ---

    try {
      // 4. Send the update to the backend in the background
      const updatedCartFromServer = await apiUpdateCartItem(bookId, subscription);
      // 5. Sync the final state with the server's response to ensure consistency
      setCart(updatedCartFromServer);
    } catch (err: any) {
      console.error("Failed to update item:", err);
      setError(err.message);
      // 6. If the API call fails, revert to the previous state
      setCart(previousCart);
    }
  };

  const checkout = async () => {
    try {
      // In a real app, you'd get this from a time picker.
      await apiCheckoutCart("07:00:00");
      // Clear cart optimistically - no need to refetch since cart should be empty after checkout
      setCart(null);
      alert("Checkout successful! Your book is being generated.");
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setError(err.message);
      alert(`Checkout failed: ${err.message}`);
    }
  };

  const checkoutWithCredits = async (): Promise<CartState> => {
    // Prevent multiple concurrent checkouts
    if (checkoutLockRef.current) {
      console.log('Checkout already in progress, preventing duplicate checkout');
      throw new Error('Checkout is already in progress. Please wait.');
    }

    const previousCart = cart;
    const previousCredits = userCredits;
    if (!cart) {
      throw new Error("Cannot checkout with an empty cart.");
    }

    // Set checkout lock and state
    checkoutLockRef.current = true;
    setIsCheckingOut(true);
    cartClearedRef.current = true;

    // Immediately and definitively clear cart state
    setCart(null);
    setUserCredits(prev => Math.max(0, prev - cart.total));

    try {
      // In a real app, you'd get this from a time picker.
      const result = await apiCheckoutWithCredits("07:00:00");

      // Store order ID in session storage for success page
      if (result.order && result.order.id) {
        sessionStorage.setItem('credits_order_id', result.order.id);
      }

      if (!result.order) {
        throw new Error("Checkout succeeded but no order data was returned.");
      }

      // Schedule a delayed cart refresh to ensure backend has processed the checkout
      // This prevents race conditions where fetchCart is called before backend clears the cart
      if (fetchCartTimeoutRef.current) {
        clearTimeout(fetchCartTimeoutRef.current);
      }
      fetchCartTimeoutRef.current = setTimeout(() => {
        console.log('Post-checkout cart refresh after delay');
        cartClearedRef.current = false; // Allow normal cart operations
        fetchCart(true); // Force fetch to get updated state
        fetchCredits(); // Refresh credits after purchase
      }, 1500);

      return result.order;

    } catch (err: any) {
      console.error("Credit checkout failed:", err);

      // Reset checkout state on failure
      cartClearedRef.current = false;
      setCart(previousCart);
      setUserCredits(previousCredits);

      throw err;
    } finally {
      // Always release the checkout lock and reset checkout state
      checkoutLockRef.current = false;
      setIsCheckingOut(false);
    }
  };

  const checkCredits = async () => {
    try {
      const creditInfo = await apiCheckCredits();
      return creditInfo;
    } catch (err: any) {
      console.error("Failed to check credits:", err);
      setError(err.message);
      throw err;
    }
  };

  const checkoutWithPayPal = async (): Promise<string> => {
    try {
      const response = await createPayPalPayment();
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
    } catch (err: any) {
      console.error("PayPal checkout failed:", err);
      setError(err.message);
      throw err;
    }
  };

  const checkoutWithCashfree = async (): Promise<CashfreeVerificationResult> => {
    try {
      const result = await cashfreePaymentService.processPayment();

      if (result.status === 'success') {
        // Store payment details in session storage for success page
        sessionStorage.setItem('cashfree_payment_type', 'order');
        if (result.order?.id) {
          sessionStorage.setItem('cashfree_order_id', result.order.id);
        }

        // Cart will be empty after successful payment - no need to refetch

        // Redirect to success page
        window.location.href = '/payment/success?gateway=cashfree';
      }

      return result;
    } catch (err: any) {
      console.error("Cashfree checkout failed:", err);
      setError(err.message);
      throw err;
    }
  };

  // --- Derived State & Helpers ---
  const isItemInCart = (bookId: string) => {
    return cart?.items.some(item => item.book_id === bookId) ?? false;
  };

  const getCartCount = () => cart?.items.length ?? 0;

  const value = {
    cart,
    isLoading,
    error,
    userCredits,
    isCheckingOut,
    addItemToCart,
    removeItemFromCart,
    updateItemSubscription,
    checkout,
    checkoutWithCredits,
    checkoutWithPayPal,
    checkoutWithCashfree,
    checkCredits,
    isItemInCart,
    getCartCount,
    setCart,
    fetchCredits // Expose fetchCredits for when credits might have changed
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
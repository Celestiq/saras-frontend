// frontend/context/CartContext.tsx
import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
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

// --- TYPE DEFINITIONS (Matching Backend) ---
export interface Book {
  generated_title: string;
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
  addItemToCart: (bookId: string, title: string) => Promise<void>;
  removeItemFromCart: (bookId: string) => Promise<void>;
  updateItemSubscription: (bookId: string, subscription: boolean) => Promise<void>;
  checkout: () => Promise<void>;
  checkoutWithCredits: () => Promise<void>;
  checkoutWithPayPal: () => Promise<string>;
  checkCredits: () => Promise<{ cart_total: number, user_credits: number, sufficient_credits: boolean, has_profile: boolean }>;
  isItemInCart: (bookId: string) => boolean;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add this helper function at the top of the component
  const isTokenValid = useCallback((token: string): boolean => {
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

  const fetchCart = useCallback(async () => {
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
      const cartData = await getCart();
      console.log("CartContext: Successfully fetched cart data:", cartData);
      setCart(cartData);
    } catch (err: any) {
      console.error("CartContext: Failed to fetch cart:", err);

      // Check for various authentication error patterns
      const isAuthError = err.message.includes('Authentication token not found') ||
        err.message.includes('401') ||
        err.message.includes('Unauthorized') ||
        err.message.includes('Invalid token') ||
        err.message.includes('Token expired') ||
        err.message.includes('JWT') ||
        err.status === 401;

      if (isAuthError) {
        console.log('CartContext: Authentication error detected, clearing invalid token and cart');
        setCart(null);
        localStorage.removeItem('authToken'); // Clear invalid token
        setError(null); // Clear error since we've handled it
      } else {
        setError(err.message || 'Could not load cart data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isTokenValid]);

  useEffect(() => {
    fetchCart();
  }, []);

  // --- Cart Actions ---
  const addItemToCart = async (bookId: string, title: string) => {
    // Optimistic UI update
    const previousCart = cart;
    const newBook = { generated_title: title };
    const newItem: CartItem = { book_id: bookId, book: newBook, subscription: true, unit_price: 1.00 };
    if (cart) {
      setCart({ ...cart, items: [...cart.items, newItem] });
    }

    try {
      const updatedCart = await apiAddItemToCart(bookId, true); // Default to subscription
      console.log("Cart after adding item:", updatedCart);
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
    // Optimistic update for immediate UI feedback
    if (cart) {
      const newItems = cart.items.map(item => item.book_id === bookId ? { ...item, subscription } : item);
      setCart({ ...cart, items: newItems });
    }

    try {
      const updatedCart = await apiUpdateCartItem(bookId, subscription);
      setCart(updatedCart);
    } catch (err: any) {
      console.error("Failed to update item:", err);
      setError(err.message);
      setCart(previousCart); // Revert
    }
  };

  const checkout = async () => {
    try {
      // In a real app, you'd get this from a time picker.
      await apiCheckoutCart("07:00:00");
      // After checkout, the cart is no longer a 'draft', so we refetch.
      fetchCart();
      alert("Checkout successful! Your book is being generated.");
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setError(err.message);
      alert(`Checkout failed: ${err.message}`);
    }
  };

  const checkoutWithCredits = async () => {
    console.log('[CART_CONTEXT] Starting credit checkout process');
    try {
      // In a real app, you'd get this from a time picker.
      console.log('[CART_CONTEXT] Calling API for credit checkout');
      const result = await apiCheckoutWithCredits("07:00:00");
      console.log('[CART_CONTEXT] Credit checkout successful, result:', result);

      // Store order ID in session storage for success page
      if (result.order && result.order.id) {
        sessionStorage.setItem('credits_order_id', result.order.id);
      }

      // After checkout, the cart is no longer a 'draft', so we refetch.
      fetchCart();

      // Redirect to success page instead of showing alert
      window.location.href = '/payment/success';
    } catch (err: any) {
      console.error("[CART_CONTEXT] Credit checkout failed - Full error object:", err);
      console.error("[CART_CONTEXT] Error message:", err.message);
      console.error("[CART_CONTEXT] Error status:", err.status);
      console.error("[CART_CONTEXT] Error response:", err.response);
      setError(err.message || 'Unknown error occurred');
      alert(`Credit checkout failed: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const checkCredits = async () => {
    console.log('[CART_CONTEXT] Checking user credits');
    try {
      const creditInfo = await apiCheckCredits();
      console.log('[CART_CONTEXT] Credit check result:', creditInfo);
      return creditInfo;
    } catch (err: any) {
      console.error("[CART_CONTEXT] Failed to check credits:", err);
      setError(err.message);
      throw err;
    }
  };

  const checkoutWithPayPal = async (): Promise<string> => {
    try {
      // The backend now decides the payment type (subscription or one-time order)
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

  // --- Derived State & Helpers ---
  const isItemInCart = (bookId: string) => {
    return cart?.items.some(item => item.book_id === bookId) ?? false;
  };

  const getCartCount = () => cart?.items.length ?? 0;

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
    getCartCount,
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
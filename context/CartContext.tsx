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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);

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

  const fetchCart = useCallback(async () => {
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

    try {
      setError(null);
      setIsLoading(true);

      // Fetch cart and credits in parallel
      const [cartData, creditInfo] = await Promise.all([
        getCart(),
        apiCheckCredits().catch(() => ({ user_credits: 0 })) // Fallback to 0 credits if check fails
      ]);

      setCart(cartData);
      setUserCredits(creditInfo.user_credits || 0);
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
      // After checkout, the cart is no longer a 'draft', so we refetch.
      fetchCart();
      alert("Checkout successful! Your book is being generated.");
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setError(err.message);
      alert(`Checkout failed: ${err.message}`);
    }
  };

  const checkoutWithCredits = async (): Promise<CartState> => {
    const previousCart = cart;
    const previousCredits = userCredits;
    if (!cart) {
      throw new Error("Cannot checkout with an empty cart.");
    }

    // Optimistic UI update: clear cart and deduct credits immediately
    setCart({
      ...cart,
      items: [],
      total: 0,
    });
    setUserCredits(prev => Math.max(0, prev - cart.total));

    try {
      // In a real app, you'd get this from a time picker.
      const result = await apiCheckoutWithCredits("07:00:00");

      // Store order ID in session storage for success page
      if (result.order && result.order.id) {
        sessionStorage.setItem('credits_order_id', result.order.id);
      }

      // After checkout, the cart is no longer a 'draft', so we refetch.
      fetchCart();

      if (!result.order) {
        throw new Error("Checkout succeeded but no order data was returned.");
      }
      return result.order;
      // window.location.href = '/payment/success';

    } catch (err: any) {
      console.error("Credit checkout failed:", err);
      setCart(previousCart);
      setUserCredits(previousCredits); // Revert credits on failure
      // setError(err.message || 'Unknown error occurred');
      // alert(`Credit checkout failed: ${err.message || 'Unknown error occurred'}`);
      throw err;
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

        // After successful payment, refetch cart
        fetchCart();

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
    setCart
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
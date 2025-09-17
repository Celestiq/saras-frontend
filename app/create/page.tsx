// frontend/app/create/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingCart, Feather, Loader2, Wand2, AlertTriangle, X, CheckCircle, Plus, Edit, Info, BookCopy, LogOut, CreditCard, Zap
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createWish, getUserProfile, refineWish } from '@/services/api';
import type { CartItem } from '@/context/CartContext';
import { PaymentMethodModal } from '@/components/payment/PaymentMethodModal';

// --- UI Components from shadcn/ui ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- Type Definitions ---
interface Topic { title: string; context: string; }
interface Module { module_title: string; topics: Topic[]; }
interface Plan { plan_id: string; modules: Module[]; subject: string; book_id: string; }

const TYPEWRITER_HINTS = ["explain AI for product managers", "teach me SQL from scratch", "make Indian philosophy easy"];
const MotionButton = motion(Button);

// --- Sub-Components ---

function ProfileButton() {
  const [user, setUser] = useState<{ name: string; email: string; imageUrl: string, credits: number }>({ name: '', email: '', imageUrl: '', credits: 0 });

  useEffect(() => {
    // Fetch user profile on component mount
    async function fetchUserProfile() {
      try {
        const profile = await getUserProfile();
        setUser({
          name: profile.full_name,
          email: profile.email,
          imageUrl: profile.avatar_url || "",
          credits: profile.credits || 0
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    }
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    // Clear user session from local storage
    localStorage.removeItem('authToken');
    // Redirect to the login page
    window.location.href = '/auth/login';
  };

  // Get user initials for the avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="bg-muted-foreground text-sm text-white p-2 rounded-md mr-4 hidden md:inline cursor-pointer">Credits: <span className="font-bold">{user.credits}</span></p>
          </TooltipTrigger>
          <TooltipContent className="p-4 max-w-xs bg-transparent">
            <div className="text-center space-y-1">
              <Button size="sm" className="w-full h-12 bg-primary text-white border-2 border-ring" onClick={() => window.location.href = '/credits'}>
                Get More Credits
              </Button>
              <p className="text-xs text-muted-foreground">
                Use reserved credits to generate books at cheaper rate
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={user.imageUrl} alt={user.name} />
              <AvatarFallback className="text-card bg-primary">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="font-bold">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => window.location.href = '/order-history'}>
            <BookCopy className="mr-2 h-4 w-4" />
            <span>Order History</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


function Header() {
  return (
    <header className="flex-shrink-0 sticky top-0 z-30 bg-background/80 backdrop-blur-sm shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2"><Feather className="w-6 h-6 text-primary" /><span className="font-display text-xl font-bold">Saras</span></Link>
        <ProfileButton />
      </div>
    </header>
  );
}

function WishInputCard({ onCreate, onRefine, onNew, onStartRefine, pageState, inputMode }: {
  onCreate: (wish: string) => void;
  onRefine: (instructions: string) => void;
  onNew: () => void;
  onStartRefine: () => void;
  pageState: 'idle' | 'submitting' | 'planReady' | 'error';
  inputMode: 'create' | 'refine';
}) {
  const [text, setText] = useState('');
  const isSubmitting = pageState === 'submitting';

  useEffect(() => {
    if (inputMode === 'refine' || (inputMode === 'create' && pageState === 'idle')) {
      setText('');
    }
  }, [inputMode, pageState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (inputMode === 'create') { onCreate(text); } else { onRefine(text); }
  };

  const label = inputMode === 'create' ? "I wish I had a book that" : "This book should...";
  const buttonText = inputMode === 'create' ? "See my plan" : "Refine";

  return (
    <Card className="rounded-lg w-full bg-card/80 backdrop-blur shadow-md border p-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <label htmlFor="wish-input" className="font-medium whitespace-nowrap">{label}</label>
        <Input id="wish-input" value={text} onChange={e => setText(e.target.value)} placeholder={TYPEWRITER_HINTS[0]} className="flex-grow bg-transparent border-0 border-b-2 rounded-none focus-visible:ring-0 focus:border-primary" disabled={isSubmitting} maxLength={140} />
        <div className="w-full sm:w-auto flex items-center gap-2">
          <AnimatePresence mode="wait">
            {pageState === 'planReady' ? (
              <motion.div key="refine-actions" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onNew} className="rounded-lg bg-primary text-white"><Plus className="w-4 h-4 mr-2" />New Book</Button>
                <Button type="button" variant="outline" onClick={onStartRefine} className="rounded-lg bg-background text-muted-foreground"><Edit className="w-4 h-4 mr-2" />Refine</Button>
              </motion.div>
            ) : (
              <motion.div key="create-action" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <Button type="submit" className="w-full rounded-lg" disabled={isSubmitting || !text.trim()}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </Card>
  );
}

function PlanRail({ plan, onAddToCart, isInCart }: { plan: Plan, onAddToCart: () => Promise<void>, isInCart: boolean }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCartClick = async () => {
    setIsAdding(true);
    await onAddToCart();
    setIsAdding(false);
  }

  const moduleColors = ["border-primary/60", "border-secondary/40", "border-accent-foreground/30", "border-muted-foreground/30"];
  return (
    <Card className="h-full flex flex-col bg-card">
      <CardHeader>
        <CardTitle className="font-display text-2xl">{plan.subject}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-4 space-y-4">
        {plan.modules.map((module, i) => (<ModuleCard key={i} module={module} color={moduleColors[i]} />))}
      </CardContent>
      <CardFooter className="flex-shrink-0 flex items-center justify-center gap-4 pt-4 border-t max-h-8">
        <Button onClick={handleAddToCartClick} className="rounded-lg disabled:bg-success disabled:text-primary-foreground" disabled={isInCart || isAdding}>
          {isAdding ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (isInCart ? <><CheckCircle className="w-5 h-5 mr-2" /> Added to Cart</> : 'Add to Cart')}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ModuleCard({ module, color }: { module: Module; color: string }) {
  return (
    <Card className={`rounded-lg shadow-sm border-l-4 ${color}`}>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="px-4 py-0 font-display text-lg">{module.module_title}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-0">
            <TooltipProvider>
              <ul className="space-y-2 text-muted-foreground">
                {module.topics.slice(0, 7).map((topic, i) => (
                  <li key={i} className="text-sm flex justify-between items-center gap-2">
                    <div className="flex items-start">
                      <span className="font-semibold w-19 shrink-0">Chapter {i + 1}:</span>
                      <span className="flex-1">{topic.title}</span>
                    </div>
                    {topic.context && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="shrink-0 text-muted-foreground/70 hover:text-foreground transition-colors">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent style={{ maxWidth: '200px' }}>
                          <p className="max-w-xs text-center">{topic.context}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function SkeletonPlan() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="h-8 bg-muted rounded-md w-2/3 animate-pulse"></div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg h-16 w-full animate-pulse"></div>
        ))}
      </CardContent>
      <CardFooter className="flex-shrink-0 flex items-center justify-center gap-4 pt-4 border-t">
        <div className="h-10 bg-muted rounded-lg w-32 animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}

function CartPanel() {
  const { cart, updateItemSubscription, removeItemFromCart, checkoutWithPayPal, checkoutWithCredits, checkoutWithCashfree, checkCredits, isLoading, setCart } = useCart();
  // const [creditInfo, setCreditInfo] = useState<{ cart_total: number, user_credits: number, sufficient_credits: boolean, has_profile: boolean } | null>(null);
  // const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  // const [isCreditCheckoutLoading, setIsCreditCheckoutLoading] = useState(false);
  // const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  // const isCheckingCreditsRef = useRef(false);

  const [userCredits, setUserCredits] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true); // For the initial load

  const [isCreditCheckoutLoading, setIsCreditCheckoutLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    async function fetchUserCredits() {
        setIsLoadingCredits(true);
        try {
            // The checkCredits API call now only runs once
            const info = await checkCredits();
            setUserCredits(info.user_credits || 0);
        } catch (error) {
            console.error("Failed to fetch user credits:", error);
        } finally {
            setIsLoadingCredits(false);
        }
    }
    fetchUserCredits();
  }, []);

  const handlePayPalCheckout = async () => {
    try {
      const approvalUrl = await checkoutWithPayPal();
      window.location.href = approvalUrl;
    } catch (error: unknown) {
      console.error("PayPal checkout failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Checkout failed: ${errorMessage}`);
    }
  };

  const handleCreditCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Cannot checkout with an empty cart');
      return;
    }

    setIsCreditCheckoutLoading(true);

    try {
      const finalOrder = await checkoutWithCredits();

      if (finalOrder && finalOrder.id) {
          sessionStorage.setItem('credits_order_id', finalOrder.id);
      }

      window.location.href = '/payment/success';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Credit checkout failed: ${errorMessage}`);
      setIsCreditCheckoutLoading(false);

    }
  };

  const handleCashfreeCheckout = async () => {
    try {
      await checkoutWithCashfree();
      // The checkoutWithCashfree function handles redirecting to success page
    } catch (error: unknown) {
      console.error("Cashfree checkout failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Cashfree checkout failed: ${errorMessage}`);
    }
  };

  const handleProceedToCheckout = () => {
    setIsPaymentModalOpen(true);
  };

  // const handleCheckCredits = useCallback(async () => {
  //   if (!cart || cart.items.length === 0) {
  //     setCreditInfo(null);
  //     return;
  //   }

  //   // Prevent multiple simultaneous credit checks
  //   if (isCheckingCreditsRef.current) {
  //     return;
  //   }

  //   isCheckingCreditsRef.current = true;
  //   setIsCheckingCredits(true);
  //   try {
  //     const info = await checkCredits();
  //     setCreditInfo(info);
  //   } catch (error: unknown) {
  //     console.error("Failed to check credits:", error);
  //     // Silently fail or show a non-blocking error
  //   } finally {
  //     setIsCheckingCredits(false);
  //     isCheckingCreditsRef.current = false;
  //   }
  // }, [cart]);

  // // Check credits whenever the cart contents change
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     handleCheckCredits();
  //   }, 300); // Debounce to avoid rapid firing
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [handleCheckCredits]);


  if (isLoading && !cart) {
    return <Card className="shadow-lg h-full flex items-center justify-center bg-card">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </Card>
  }

  // Animation variants for the spinning effect
  const flipVariants = {
    initial: { rotateY: -90, opacity: 0, scale: 0.9 },
    animate: { rotateY: 0, opacity: 1, scale: 1 },
    exit: { rotateY: 90, opacity: 0, scale: 0.9 },
  };

  const cartTotal = cart?.total ?? 0;
  const sufficientCredits = userCredits >= cartTotal;

  return (
    <Card className="shadow-lg h-full flex flex-col bg-card">
      <CardHeader><CardTitle className="font-display text-2xl">Order Summary</CardTitle></CardHeader>
      <CardContent className="flex-grow overflow-y-auto pr-2 space-y-4">
        {cart && cart.items.length > 0 ? (
          <>
            {cart.items.map(item => (
              <motion.div key={item.book_id} layout>
                <CartItemCard
                  item={item}
                  onTypeChange={updateItemSubscription}
                  onRemove={removeItemFromCart}
                />
              </motion.div>
            ))}
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <ShoppingCart className="mx-auto w-12 h-12 mb-2" />
            <p>Your cart is empty.</p>
            <p className="text-sm">Add a plan to get started.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-shrink-0 pt-4 border-t">
        <div className="w-full space-y-2" style={{ perspective: '1000px' }}>
          <div className="flex gap-2 w-full">
            {/* Left side container for credit button OR purchase text */}
            <div className="w-1/2">
              <AnimatePresence mode="wait" initial={false}>
                {isLoadingCredits ? (
                  <motion.div
                    key="loader"
                    {...flipVariants}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="h-12 flex items-center justify-center"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </motion.div>
                ) : sufficientCredits ? (
                  <motion.div
                    key="credit-button"
                    {...flipVariants}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <MotionButton
                      size="lg"
                      className="w-full h-12 text-base bg-green-600 hover:bg-green-700 text-white"
                      disabled={!cart || cart.items.length === 0 || isCreditCheckoutLoading}
                      onClick={handleCreditCheckout}
                      // --- ADD THESE PROPS FOR THE BREATHING EFFECT ---
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 1,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                      // --------------------------------------------------
                    >
                      {isCreditCheckoutLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                      Pay with Credits
                    </MotionButton>
                  </motion.div>
                ) : (
                  <motion.div
                    key="purchase-button"
                    {...flipVariants}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="h-12 flex items-center justify-center"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <MotionButton
                            variant="outline"
                            className="w-full h-12 text-base text-primary border-primary/50 hover:bg-primary/5 hover:text-primary/80"
                            onClick={() => window.location.href = '/credits'}
                            // The breathing animation is still here
                            animate={{ 
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 0.5,
                              ease: "easeInOut",
                              repeat: Infinity,
                            }}
                          >
                            Purchase Credits
                          </MotionButton>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Use credits for a cheaper price.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right side container for Checkout button */}
            <div className="w-1/2">
              <Button
                size="lg"
                className="w-full h-12 text-base"
                disabled={!cart || cart.items.length === 0}
                onClick={handleProceedToCheckout}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPayPalCheckout={handlePayPalCheckout}
        onCashfreeCheckout={handleCashfreeCheckout}
        onCreditCheckout={handleCreditCheckout}
        userCredits={userCredits}
        sufficientCredits={sufficientCredits}
        isCreditCheckoutLoading={isCreditCheckoutLoading}
        cartTotal={cart?.total || 0}
      />
    </Card>
  );
}

function CartItemCard({ item, onTypeChange, onRemove }: { item: CartItem, onTypeChange: (bookId: string, sub: boolean) => void, onRemove: (bookId: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-grow min-w-0">
        <p className="font-semibold truncate">{item.book.generated_title}</p>
        <div className="flex items-center space-x-2 text-sm mt-1">
          <label htmlFor={`switch-${item.book_id}`} className="font-medium pr-1">${item.unit_price.toFixed(2)}</label>
          <Switch id={`switch-${item.book_id}`} checked={item.subscription} onCheckedChange={(checked) => onTypeChange(item.book_id, checked)} className="data-[state=checked]:bg-primary" />
          <span className="w-24 text-left capitalize">{item.subscription ? 'Subscription' : 'One-Time'}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => onRemove(item.book_id)}><X className="w-5 h-5" /></Button>
    </div>
  );
}

function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const { getCartCount } = useCart();
  return (
    <button onClick={onClick} className="lg:hidden fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center">
      <ShoppingCart className="w-7 h-7" />{getCartCount() > 0 && <Badge className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground h-6 w-6 rounded-full flex items-center justify-center p-0">{getCartCount()}</Badge>}
    </button>
  );
}

function MobileCartModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
          <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative z-10 w-full max-w-lg h-[85vh] p-4">
            <CartPanel />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>);
}

// --- Main Page Component ---
export default function CreatePage() {
  type PageState = 'idle' | 'submitting' | 'planReady' | 'error';
  const [pageState, setPageState] = useState<PageState>('idle');
  const [inputMode, setInputMode] = useState<'create' | 'refine'>('create');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { addItemToCart, isItemInCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCreateSubmit = async (submittedWish: string) => {
    setPageState('submitting'); setErrorMessage('');
    try {
      const response = await createWish(submittedWish);
      const newPlan: Plan = { plan_id: response.wish.id, modules: response.roadmap.modules, subject: response.roadmap.subject, book_id: response.book.id };
      setPlan(newPlan); setPageState('planReady');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setErrorMessage(errorMessage);
      setPageState('error');
    }
  };

  const handleRefineSubmit = async (instructions: string) => {
    if (!plan) return;
    setPageState('submitting'); setErrorMessage('');
    try {
      const response = await refineWish(plan.plan_id, instructions);
      const newPlan: Plan = { plan_id: response.wish.id, modules: response.roadmap.modules, subject: response.roadmap.subject, book_id: response.book.id };
      setPlan(newPlan); setPageState('planReady');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setErrorMessage(errorMessage);
      setPageState('error');
    }
    setInputMode('refine');
  };

  const handleNewBook = () => { setPlan(null); setPageState('idle'); setInputMode('create'); };
  const handleStartRefine = () => { setInputMode('refine'); };
  const handleAddToCart = async () => { if (plan) { await addItemToCart(plan.book_id, plan.subject); } };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col container mx-auto px-4 sm:px-6 py-4 lg:py-8 min-h-0">
        <div className="flex-shrink-0">
          <div className="flex items-center gap-3 justify-center text-center lg:flex-col lg:gap-0">
            <Wand2 className="w-8 h-8 lg:w-10 lg:h-10 mx-auto text-card-foreground lg:mb-4" />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl tracking-tight font-bold">Craft your 28-day book.</h1>
              <p className="mt-1 text-muted-foreground text-sm sm:text-base font-sans">One chapter a day, written just for you.</p>
            </div>
          </div>
          <div className="mt-4 lg:mt-6 w-full max-w-3xl mx-auto"><WishInputCard onCreate={handleCreateSubmit} onRefine={handleRefineSubmit} onNew={handleNewBook} onStartRefine={handleStartRefine} pageState={pageState} inputMode={inputMode} /></div>
        </div>
        <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-8 pt-4 lg:pt-8">
          <div className="min-h-0 lg:col-span-3">
            <AnimatePresence mode="wait">
              {pageState === 'idle' && (<Card className="h-full flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed">
                <p className="font-medium">Your plan will appear here.</p>
                <p className="text-sm">Tell us what you want to learn to get started.</p>
              </Card>)}
              {pageState === 'submitting' && (<motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><SkeletonPlan /></motion.div>)}
              {pageState === 'error' && (<motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <Card className="h-full flex flex-col items-center justify-center text-center bg-destructive/10 border-destructive/20 text-destructive"><AlertTriangle className="w-8 h-8 mb-2" />
                  <p className="font-bold">Something went wrong</p>
                  <p className="text-sm">{errorMessage}</p>
                </Card></motion.div>)}
              {pageState === 'planReady' && plan && (<motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full"><PlanRail plan={plan} onAddToCart={handleAddToCart} isInCart={isItemInCart(plan.book_id)} /></motion.div>)}
            </AnimatePresence>
          </div>
          <div className="min-h-0 hidden lg:block lg:col-span-2"><CartPanel /></div>
        </div>
      </main>
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />
      <MobileCartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
} 
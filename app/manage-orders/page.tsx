'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, AlertTriangle, BookCopy, Hash, Pause, Play, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getManageOrders, pauseSubscription, resumeSubscription, cancelSubscription } from '@/services/api';
import type { ManageOrdersResponse, SubscriptionItem, OrderResponse, OrderItemDetail } from '@/domain/types';

// --- Main Page Component ---
export default function ManageOrdersPage() {
    const [data, setData] = useState<ManageOrdersResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [cancelConfirm, setCancelConfirm] = useState<{ show: boolean; itemId: string; title: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getManageOrders();
                setData(response);
            } catch (err: unknown) {
                console.error('Error fetching manage orders data:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load manage orders data.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubscriptionAction = async (action: 'pause' | 'resume' | 'cancel', itemId: string, title?: string) => {
        if (action === 'cancel') {
            // Show confirmation dialog for cancel action
            setCancelConfirm({ show: true, itemId, title: title || 'this subscription' });
            return;
        }

        setActionLoading(itemId);
        try {
            switch (action) {
                case 'pause':
                    await pauseSubscription(itemId);
                    break;
                case 'resume':
                    await resumeSubscription(itemId);
                    break;
            }
            // Refresh data after successful action
            const response = await getManageOrders();
            setData(response);
        } catch (err: unknown) {
            console.error(`Error ${action}ing subscription:`, err);
            const errorMessage = err instanceof Error ? err.message : `Failed to ${action} subscription.`;
            setError(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirmCancel = async () => {
        if (!cancelConfirm) return;

        setActionLoading(cancelConfirm.itemId);
        try {
            await cancelSubscription(cancelConfirm.itemId);
            // Refresh data after successful action
            const response = await getManageOrders();
            setData(response);
        } catch (err: unknown) {
            console.error('Error cancelling subscription:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription.';
            setError(errorMessage);
        } finally {
            setActionLoading(null);
            setCancelConfirm(null);
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="flex-shrink-0 sticky top-0 z-30 bg-background/80 backdrop-blur-sm shadow-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <a href="/create" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Saras Logo"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                        />
                        <span className="font-display text-xl font-bold">Saras</span>
                    </a>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-center">Manage Orders</h1>
                    <p className="text-muted-foreground text-center mt-2">Manage your subscriptions and view order history.</p>
                    <div className="flex justify-center mt-6">
                        <Button asChild size="lg" variant="outline">
                            <Link href="/create">Back to Create</Link>
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center text-destructive bg-destructive/10 p-4 rounded-lg">
                        <AlertTriangle className="mx-auto w-8 h-8 mb-2" />
                        {error}
                    </div>
                ) : !data ? (
                    <div className="text-center py-16">
                        <BookCopy className="mx-auto w-16 h-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-display font-semibold">No data available</h2>
                        <p className="text-muted-foreground mt-2">Unable to load your orders and subscriptions.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Newsletters Section */}
                        <NewslettersSection
                            subscriptions={data.subscriptions}
                            onAction={handleSubscriptionAction}
                            actionLoading={actionLoading}
                        />

                        {/* Order History Section */}
                        <OrderHistorySection orders={data.order_history} />
                    </div>
                )}
            </main>

            {/* Cancel Confirmation Dialog */}
            {cancelConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                Confirm Cancellation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to cancel <strong>&ldquo;{cancelConfirm.title}&rdquo;</strong>?
                                This action cannot be undone and you will stop receiving new chapters.
                            </p>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setCancelConfirm(null)}
                                    disabled={actionLoading === cancelConfirm.itemId}
                                >
                                    No, Keep Subscription
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleConfirmCancel}
                                    disabled={actionLoading === cancelConfirm.itemId}
                                >
                                    {actionLoading === cancelConfirm.itemId ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    Yes, Cancel Subscription
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

// --- Newsletters Section Component ---
function NewslettersSection({
    subscriptions,
    onAction,
    actionLoading
}: {
    subscriptions: SubscriptionItem[];
    onAction: (action: 'pause' | 'resume' | 'cancel', itemId: string, title?: string) => void;
    actionLoading: string | null;
}) {
    const activeSubscriptions = subscriptions.filter(sub =>
        sub.subscription_status === 'active' || sub.subscription_status === 'paused'
    );

    if (activeSubscriptions.length === 0) {
        return (
            <div>
                <h2 className="font-display text-2xl font-bold mb-6">Newsletters</h2>
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <BookCopy className="mx-auto w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-display font-semibold">No active subscriptions</h3>
                    <p className="text-muted-foreground mt-2">Your active newsletter subscriptions will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="font-display text-2xl font-bold mb-6">Newsletters</h2>
            <div className="overflow-x-auto">
                <div className="flex gap-4 pb-4 min-w-max">
                    {activeSubscriptions.map(subscription => (
                        <NewsletterCard
                            key={subscription.id}
                            subscription={subscription}
                            onAction={onAction}
                            isLoading={actionLoading === subscription.id}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Newsletter Card Component ---
function NewsletterCard({
    subscription,
    onAction,
    isLoading
}: {
    subscription: SubscriptionItem;
    onAction: (action: 'pause' | 'resume' | 'cancel', itemId: string, title?: string) => void;
    isLoading: boolean;
}) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'paused': return <Badge variant="secondary">Paused</Badge>;
            case 'completed': return <Badge variant="outline">Completed</Badge>;
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

    return (
        <Card className="w-80 flex-shrink-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-display line-clamp-2">
                        {subscription.book.generated_title}
                    </CardTitle>
                    {getStatusBadge(subscription.subscription_status)}
                </div>
                <p className="text-sm text-muted-foreground">
                    Started {formatDate(subscription.order.created_at)}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{subscription.idx_sent} chapters delivered</span>
                </div>

                <Separator />

                <div className="flex gap-2">
                    {subscription.subscription_status === 'active' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAction('pause', subscription.id)}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Pause className="w-4 h-4 mr-1" />
                                    Pause
                                </>
                            )}
                        </Button>
                    )}

                    {subscription.subscription_status === 'paused' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAction('resume', subscription.id)}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-1" />
                                    Resume
                                </>
                            )}
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onAction('cancel', subscription.id, subscription.book.generated_title)}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Order History Section Component ---
function OrderHistorySection({ orders }: { orders: OrderResponse[] }) {
    if (orders.length === 0) {
        return (
            <div>
                <h2 className="font-display text-2xl font-bold mb-6">Order History</h2>
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <BookCopy className="mx-auto w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-display font-semibold">No order history</h3>
                    <p className="text-muted-foreground mt-2">Your completed orders will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="font-display text-2xl font-bold mb-6">Order History</h2>
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
        </div>
    );
}

// --- Order Card Component (reused from order-history) ---
function OrderCard({ order }: { order: OrderResponse }) {
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
            case 'pending': return <Badge variant="secondary">Pending</Badge>;
            case 'failed': return <Badge variant="destructive">Failed</Badge>;
            case 'generating': return <Badge variant="outline">Generating</Badge>;
            case 'draft': return <Badge variant="outline">Draft</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="shadow-md">
            <Accordion type="single" collapsible>
                <AccordionItem value={order.id} className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                            <div className="text-left flex-1">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="space-y-1">
                                        {order.items.map((item, index) => (
                                            <p key={item.id} className="font-semibold text-sm">
                                                {item.book.generated_title}
                                                {index < order.items.length - 1 && ','}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <Separator className="mb-4" />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="font-bold font-display text-lg">Order #{order.id.split('-')[0]}</p>
                                <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                {order.items.map(item => <OrderItemRow key={item.id} item={item} />)}
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between font-bold"><span >Total</span><span>${order.total.toFixed(2)}</span></div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}

// --- Order Item Row Component ---
function OrderItemRow({ item }: { item: OrderItemDetail }) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <p className="font-semibold">{item.book.generated_title}</p>
                <p className="text-xs text-muted-foreground">{item.subscription ? 'Subscription' : 'One-Time Purchase'}</p>
            </div>
            <p className="font-medium">${item.unit_price.toFixed(2)}</p>
        </div>
    );
}

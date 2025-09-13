// frontend/app/order-history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Feather, Loader2, AlertTriangle, BookCopy, Calendar, Tag, Clock, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getOrderHistory } from '@/services/api';
import type { OrderResponse, OrderItemDetail } from '@/domain/types'; // Assuming types are defined

// --- Main Page Component ---
export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrderHistory();
                setOrders(data);
            } catch (err: unknown) {
                console.error('Error fetching order history:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load order history.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="flex-shrink-0 sticky top-0 z-30 bg-background/80 backdrop-blur-sm shadow-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <a href="/create" className="flex items-center gap-2"><Feather className="w-6 h-6 text-primary" /><span className="font-display text-xl font-bold">Saras</span></a>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-center">Order History</h1>
                    <p className="text-muted-foreground text-center mt-2">A record of all your created books.</p>
                    <div className="flex justify-center mt-6">
                        <Button asChild size="lg" variant="outline">
                            <Link href="/create">Back to Create</Link>
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : error ? (
                    <div className="text-center text-destructive bg-destructive/10 p-4 rounded-lg"><AlertTriangle className="mx-auto w-8 h-8 mb-2" />{error}</div>
                ) : orders.length === 0 ? (
                    <NoOrdersState />
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {orders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                )}
            </main>
        </div>
    );
}

// --- Sub-Components ---

function NoOrdersState() {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg max-w-2xl mx-auto">
            <BookCopy className="mx-auto w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-display font-semibold">No books ordered yet</h2>
            <p className="text-muted-foreground mt-2">Your created and purchased books will appear here.</p>
            <Button asChild size="lg" className="mt-6">
                <Link href="/create">Start Your Journey</Link>
            </Button>
        </div>
    );
}

function OrderCard({ order }: { order: OrderResponse }) {
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge variant="success">Completed</Badge>;
            case 'pending': return <Badge variant="secondary">Pending</Badge>;
            case 'failed': return <Badge variant="destructive">Failed</Badge>;
            case 'generating': return <Badge variant="generating">Generating</Badge>;
            case 'draft': return <Badge variant="default">Draft</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="shadow-md">
            <Accordion type="single" collapsible>
                <AccordionItem value={order.id} className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                            <div className="text-left">
                                <p className="font-bold font-display text-lg">Order #{order.id.split('-')[0]}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <Separator className="mb-4" />
                        <div className="space-y-4">
                            {order.items.map(item => <OrderItemRow key={item.book_id} item={item} />)}
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${order.sub_total.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-${order.discount.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold"><span >Total</span><span>${order.total.toFixed(2)}</span></div>
                        </div>
                        {/* {order.time_to_send && order.items.some(item => item.subscription) && (
                            <>
                                <Separator className="my-4" />
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Chapters delivered daily at: <strong>{order.time_to_send}</strong></span>
                                </div>
                            </>
                        )} */}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}

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

// You might need to add a 'success' variant to your Badge component's styles
// or create a new `domain/types.ts` file for the response types.
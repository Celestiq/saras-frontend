// frontend/domain/types.ts

// --- API Response Types ---

// Represents the nested book information in an order item
export interface BookInfo {
  generated_title: string;
}

// Represents a single item within an order
export interface OrderItemDetail {
  id: string;
  book_id: string;
  subscription: boolean;
  unit_price: number;
  book: BookInfo;
}

// Represents a single order object in the order history
export interface OrderResponse {
  id: string;
  status: string;
  created_at: string;
  total: number;
  time_to_send: string | null;
  sub_total: number;
  discount: number;
  items: OrderItemDetail[];
}

// --- Subscription Types ---

// Represents a subscription item from the manage-orders API
export interface SubscriptionItem {
  id: string;
  subscription_status: 'active' | 'paused' | 'completed' | 'cancelled';
  idx_sent: number;
  book: {
    id: string;
    generated_title: string;
  };
  order: {
    id: string;
    created_at: string;
  };
}

// Represents the response from the manage-orders API
export interface ManageOrdersResponse {
  subscriptions: SubscriptionItem[];
  order_history: OrderResponse[];
}

// --- Order History Types (for manage-orders) ---

// Represents order history items from the manage-orders API
export interface OrderHistoryItem {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    subscription: boolean;
    book: {
      generated_title: string;
    };
  }>;
}
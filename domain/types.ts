// frontend/domain/types.ts

// --- API Response Types ---

// Represents the nested book information in an order item
export interface BookInfo {
  generated_title: string;
}

// Represents a single item within an order
export interface OrderItemDetail {
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
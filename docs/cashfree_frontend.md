# Cashfree Payment Integration Documentation

This document provides comprehensive information for integrating Cashfree payments into the frontend application.

## Overview

The Cashfree payment system has been implemented as an alternative payment gateway alongside PayPal and credit-based payments. It supports one-time payments for cart items and follows the same database patterns as existing payment methods.

## Environment Variables Required

Add these environment variables to your `.env` file:

```env
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
CASHFREE_BASE_URL=https://sandbox.cashfree.com  # For production, use https://api.cashfree.com
```

## API Endpoints

### 1. Create Payment Session

**Endpoint:** `POST /cashfree/create-payment-session`

**Description:** Creates a Cashfree payment session for the user's cart contents.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:** None (uses cart from authenticated user)

**Response:**
```json
{
  "payment_type": "order",
  "order_id": "order_1234567890",
  "payment_session_id": "session_abcdef123456",
  "amount": 1500.00,
  "currency": "INR"
}
```

**Error Responses:**
- `400 Bad Request`: Cart is empty
- `500 Internal Server Error`: Failed to create payment session

### 2. Verify Payment

**Endpoint:** `POST /cashfree/verify-payment/{order_id}`

**Description:** Verifies the status of a Cashfree payment after user completes payment.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `order_id` (string): The Cashfree order ID to verify

**Response (Success):**
```json
{
  "status": "success",
  "message": "Payment verified and order processed successfully. Content generation has started.",
  "order": {
    "id": "db_order_id",
    "status": "pending",
    "total": 1500.00,
    "order_items": [...],
    "direct_orders": [...]
  },
  "payment_details": {
    "order_id": "order_1234567890",
    "order_status": "PAID",
    "order_amount": 1500.00,
    "order_currency": "INR",
    "customer_details": {...}
  }
}
```

**Response (Pending):**
```json
{
  "status": "pending",
  "message": "Payment status: ACTIVE",
  "payment_details": {...}
}
```

**Error Responses:**
- `404 Not Found`: Order not found
- `500 Internal Server Error`: Failed to verify payment

### 3. Get Order Status

**Endpoint:** `GET /cashfree/order-status/{order_id}`

**Description:** Get the current status of a Cashfree order.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `order_id` (string): The Cashfree order ID to check

**Response:**
```json
{
  "order_id": "order_1234567890",
  "status": "PAID",
  "amount": 1500.00,
  "currency": "INR",
  "customer_details": {
    "customer_id": "user_123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+919999999999"
  },
  "created_at": "2025-01-15T16:55:24+05:30",
  "order_expiry_time": "2025-02-15T16:55:24+05:30"
}
```

## Frontend Integration

### 1. Install Cashfree JavaScript SDK

```bash
npm install @cashfreepayments/cashfree-js
```

### 2. Initialize Cashfree SDK

```javascript
import { load } from "@cashfreepayments/cashfree-js";

// Initialize Cashfree SDK
const initializeCashfree = async () => {
  const cashfree = await load({
    mode: "sandbox" // Use "production" for live environment
  });
  return cashfree;
};
```

### 3. Complete Payment Flow

Here's a complete example of how to integrate Cashfree payments:

```javascript
import { load } from "@cashfreepayments/cashfree-js";

class CashfreePayment {
  constructor() {
    this.cashfree = null;
    this.initializeSDK();
  }

  async initializeSDK() {
    try {
      this.cashfree = await load({
        mode: "sandbox" // Change to "production" for live
      });
      console.log("Cashfree SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Cashfree SDK:", error);
    }
  }

  async createPaymentSession() {
    try {
      const response = await fetch('/cashfree/create-payment-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment session:', error);
      throw error;
    }
  }

  async processPayment() {
    try {
      // Step 1: Create payment session
      const sessionData = await this.createPaymentSession();
      console.log('Payment session created:', sessionData);

      // Step 2: Open Cashfree checkout
      const checkoutOptions = {
        paymentSessionId: sessionData.payment_session_id,
        redirectTarget: "_modal" // or "_self", "_blank", "_top"
      };

      const result = await this.cashfree.checkout(checkoutOptions);

      if (result.error) {
        console.log("Payment cancelled or error occurred:", result.error);
        return { success: false, error: result.error };
      }

      if (result.redirect) {
        console.log("Payment will be redirected");
        return { success: false, redirect: true };
      }

      if (result.paymentDetails) {
        console.log("Payment completed:", result.paymentDetails);
        
        // Step 3: Verify payment on backend
        const verificationResult = await this.verifyPayment(sessionData.order_id);
        return verificationResult;
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyPayment(orderId) {
    try {
      const response = await fetch(`/cashfree/verify-payment/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async checkOrderStatus(orderId) {
    try {
      const response = await fetch(`/cashfree/order-status/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check order status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking order status:', error);
      throw error;
    }
  }
}

// Usage example
const cashfreePayment = new CashfreePayment();

// Handle payment button click
document.getElementById('pay-with-cashfree').addEventListener('click', async () => {
  try {
    const result = await cashfreePayment.processPayment();
    
    if (result.status === 'success') {
      // Payment successful, redirect to success page
      window.location.href = '/payment/success?gateway=cashfree';
    } else if (result.status === 'pending') {
      // Payment pending, show appropriate message
      alert('Payment is being processed. Please wait...');
    } else {
      // Payment failed
      alert('Payment failed. Please try again.');
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('An error occurred during payment. Please try again.');
  }
});
```

### 4. React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { load } from "@cashfreepayments/cashfree-js";

const CashfreePaymentButton = ({ onPaymentSuccess, onPaymentError }) => {
  const [cashfree, setCashfree] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cf = await load({ mode: "sandbox" });
        setCashfree(cf);
      } catch (error) {
        console.error("Failed to initialize Cashfree SDK:", error);
      }
    };
    initializeCashfree();
  }, []);

  const handlePayment = async () => {
    if (!cashfree) {
      onPaymentError("Cashfree SDK not initialized");
      return;
    }

    setLoading(true);
    try {
      // Create payment session
      const response = await fetch('/cashfree/create-payment-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const sessionData = await response.json();

      // Open checkout
      const result = await cashfree.checkout({
        paymentSessionId: sessionData.payment_session_id,
        redirectTarget: "_modal"
      });

      if (result.paymentDetails) {
        // Verify payment
        const verifyResponse = await fetch(`/cashfree/verify-payment/${sessionData.order_id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const verifyData = await verifyResponse.json();
        
        if (verifyData.status === 'success') {
          onPaymentSuccess(verifyData);
        } else {
          onPaymentError(verifyData.message);
        }
      } else if (result.error) {
        onPaymentError(result.error);
      }
    } catch (error) {
      onPaymentError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={!cashfree || loading}
      className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Pay with Cashfree'}
    </button>
  );
};

export default CashfreePaymentButton;
```

## Database Schema Updates

The following fields have been added to support Cashfree payments:

### Orders Table
- `cashfree_order_id` (string): Cashfree's order ID
- `cashfree_payment_session_id` (string): Cashfree's payment session ID
- `cashfree_payment_status` (string): Payment status from Cashfree
- `payment_method` (string): Set to "cashfree" for Cashfree payments

### Direct Orders Table
- `gateway_order_id` (string): Cashfree's order ID
- `gateway_order_status` (string): Payment status from Cashfree
- `payment_method` (string): Set to "cashfree" for Cashfree payments

## Payment Flow

1. **User clicks "Pay with Cashfree"** → Frontend calls `/cashfree/create-payment-session`
2. **Backend creates Cashfree order** → Returns `order_id` and `payment_session_id`
3. **Frontend opens Cashfree checkout** → Uses JavaScript SDK with `payment_session_id`
4. **User completes payment** → Cashfree redirects or returns payment details
5. **Frontend verifies payment** → Calls `/cashfree/verify-payment/{order_id}`
6. **Backend verifies with Cashfree** → Updates order status and triggers content generation
7. **Success response** → Frontend redirects to success page

## Error Handling

### Common Error Scenarios

1. **Cart Empty**: User tries to pay with empty cart
2. **Payment Cancelled**: User cancels payment in Cashfree checkout
3. **Payment Failed**: Payment fails due to insufficient funds or other issues
4. **Verification Failed**: Backend cannot verify payment with Cashfree
5. **Network Issues**: API calls fail due to network problems

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

## Testing

### Sandbox Environment
- Use `https://sandbox.cashfree.com` as base URL
- Test with Cashfree's test credentials
- Use test card numbers provided by Cashfree

### Test Card Numbers
Refer to Cashfree's documentation for test card numbers and scenarios.

## Production Deployment

1. **Update Environment Variables**:
   - Set `CASHFREE_BASE_URL` to `https://api.cashfree.com`
   - Use production client ID and secret

2. **Update Frontend**:
   - Change Cashfree SDK mode to "production"
   - Update return URLs to production domain

3. **Database Migration**:
   - Ensure new fields are added to database schema
   - Test with production credentials

## Security Considerations

1. **API Keys**: Store Cashfree credentials securely in environment variables
2. **Token Validation**: Always validate JWT tokens in API endpoints
3. **Payment Verification**: Always verify payments on backend before processing
4. **HTTPS**: Ensure all API calls use HTTPS in production
5. **Error Logging**: Log payment errors for debugging without exposing sensitive data

## Support and Troubleshooting

### Common Issues

1. **SDK Not Loading**: Check network connectivity and Cashfree service status
2. **Payment Session Creation Fails**: Verify API credentials and cart contents
3. **Payment Verification Fails**: Check order ID and Cashfree API status
4. **Database Updates Fail**: Verify database schema and permissions

### Debugging

1. Check browser console for JavaScript errors
2. Check backend logs for API errors
3. Verify environment variables are set correctly
4. Test with Cashfree's test credentials first

### Contact Support

- Cashfree Documentation: https://docs.cashfree.com/
- Cashfree Support: Contact through their official support channels
- Backend Issues: Check application logs and database status
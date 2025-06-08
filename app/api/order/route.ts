import { NextResponse } from 'next/server';
import { 
  createOrder, 
  addOrderItems, 
  updateOrderStatus, 
  updatePaymentStatus, 
  getUserOrders 
} from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      payment_method,
      shipping_address,
      contact_phone,
      cartItems,
    } = body;

    // Validate input
    if (!user_id || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate total_amount from cartItems
    const total_amount = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    // Create order
    const order = await createOrder(
      user_id,
      total_amount,
      payment_method,
      shipping_address,
      contact_phone
    );

    // Add order items
    await addOrderItems(order.id, cartItems);

    // Update payment status based on payment method
    const paymentStatus = payment_method === "cash" ? "pending" : "processing";
    await updatePaymentStatus(order.id, paymentStatus);

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('Error in order placement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const orders = await getUserOrders(parseInt(userId));
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: Add PATCH for status updates if needed
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus } = body;

    if (!orderId || (!status && !paymentStatus)) {
      return NextResponse.json({ error: 'Missing orderId or status/paymentStatus' }, { status: 400 });
    }

    let result;
    if (status) {
      result = await updateOrderStatus(orderId, status);
    } else if (paymentStatus) {
      result = await updatePaymentStatus(orderId, paymentStatus);
    }

    return NextResponse.json({ success: true, order: result[0] }, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
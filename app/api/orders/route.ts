import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";
import axios from "axios";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shippingAddress, phone, paymentMethod = "sslcommerz" } = await req.json();

  // Get cart items with product details
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_id,
      products (id, name, price)
    `)
    .eq('user_id', session.user.id);

  if (cartError || !cartItems?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Calculate total
  let total = 0;
  const orderItems = cartItems.map(item => {
    const price = parseFloat(item.products.price);
    const subtotal = price * item.quantity;
    total += subtotal;
    return {
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price
    };
  });

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: session.user.id,
      total_price: total.toString(),
      status: 'pending',
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      phone: phone,
      created_at: new Date(),
    })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  // Create order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems.map(item => ({ ...item, order_id: order.id })));

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Clear cart
  await supabase.from('cart_items').delete().eq('user_id', session.user.id);

  // If SSLCommerz, initiate payment
  if (paymentMethod === "sslcommerz") {
    const paymentData = {
      store_id: process.env.SSLCOMMERZ_STORE_ID!,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
      total_amount: total,
      currency: "BDT",
      tran_id: order.id.toString(),
      success_url: `${process.env.NEXTAUTH_URL}/api/payment/success`,
      fail_url: `${process.env.NEXTAUTH_URL}/api/payment/fail`,
      cancel_url: `${process.env.NEXTAUTH_URL}/api/payment/cancel`,
      ipn_url: `${process.env.NEXTAUTH_URL}/api/payment/ipn`,
      cus_name: session.user.name || "Customer",
      cus_email: session.user.email!,
      cus_phone: phone,
      cus_add1: shippingAddress,
      ship_name: session.user.name || "Customer",
      ship_add1: shippingAddress,
      ship_city: "Dhaka",
      ship_country: "Bangladesh",
      product_name: "E-commerce Purchase",
      product_category: "General",
    };

    const sslczUrl = process.env.SSLCOMMERZ_IS_SANDBOX === "true"
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://secure.sslcommerz.com/gwprocess/v4/api.php";

    const response = await axios.post(sslczUrl, new URLSearchParams(paymentData), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.data.status === "SUCCESS") {
      await supabase
        .from('orders')
        .update({ transaction_id: response.data.transactionId })
        .eq('id', order.id);
      return NextResponse.json({ redirectUrl: response.data.GatewayPageURL });
    } else {
      return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ orderId: order.id });
}

// GET orders for user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (id, name, image_url)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(orders);
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shippingAddress, phone, paymentMethod = "sslcommerz" } = await req.json();

    // Validate required fields
    if (!shippingAddress || !phone) {
      return NextResponse.json({ error: "Shipping address and phone are required" }, { status: 400 });
    }

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

    if (cartError) {
      console.error("Cart fetch error:", cartError);
      return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = cartItems.map(item => {
      const price = parseFloat(item.products.price);
      const subtotal = price * item.quantity;
      total += subtotal;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price, // keep as string to match your DB
      };
    });

    // Create order (status 'pending')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        total_price: total.toString(),
        status: 'pending',
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        phone: phone,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map(item => ({
        ...item,
        order_id: order.id,
        created_at: new Date().toISOString(),
      })));

    if (itemsError) {
      console.error("Order items insertion error:", itemsError);
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // Clear the cart
    const { error: clearCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', session.user.id);

    if (clearCartError) {
      console.error("Clear cart error:", clearCartError);
      // Non-critical, continue
    }

    // If payment method is SSLCommerz, initiate payment
    if (paymentMethod === "sslcommerz") {
      // Validate SSLCommerz credentials
      if (!process.env.SSLCOMMERZ_STORE_ID || !process.env.SSLCOMMERZ_STORE_PASSWORD) {
        console.error("SSLCommerz credentials missing");
        return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
      }

      const paymentData = {
        store_id: process.env.SSLCOMMERZ_STORE_ID,
        store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
        total_amount: total.toFixed(2),
        currency: "BDT",
        tran_id: order.id.toString(), // unique transaction ID
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
        product_profile: "general",
      };

      const sslczUrl = process.env.SSLCOMMERZ_IS_SANDBOX === "true"
        ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
        : "https://secure.sslcommerz.com/gwprocess/v4/api.php";

      try {
        const response = await axios.post(sslczUrl, new URLSearchParams(paymentData), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        });

        if (response.data.status === "SUCCESS") {
          // Update order with transaction ID if provided
          const transactionId = response.data.transactionId || response.data.tran_id;
          if (transactionId) {
            await supabase
              .from('orders')
              .update({ transaction_id: transactionId })
              .eq('id', order.id);
          }
          // Return the redirect URL to the payment gateway
          return NextResponse.json({ redirectUrl: response.data.GatewayPageURL });
        } else {
          console.error("SSLCommerz initiation failed:", response.data);
          // Order remains with status 'pending' – you may want to mark as failed
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', order.id);
          return NextResponse.json({ error: "Payment initiation failed: " + (response.data.failedreason || "Unknown error") }, { status: 500 });
        }
      } catch (axiosError: any) {
        console.error("SSLCommerz request error:", axiosError.message);
        // Mark order as failed
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('id', order.id);
        return NextResponse.json({ error: "Payment gateway communication error" }, { status: 500 });
      }
    }

    // For Cash on Delivery or other methods, just return order ID
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET orders for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

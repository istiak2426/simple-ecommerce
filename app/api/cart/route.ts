import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

// GET cart items for user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_id,
      products (id, name, price, image_url)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: cartItems || [] });
}

// POST add item to cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity = 1 } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  // Check if item already exists
  const { data: existing, error: fetchError } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', session.user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Cart check error:", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (existing) {
    // Update quantity
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({
        quantity: existing.quantity + quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error("Cart update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    // Insert new row (id auto-generated)
    const { error: insertError } = await supabase
      .from('cart_items')
      .insert({
        user_id: session.user.id,
        product_id: productId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Cart insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// PUT update quantity
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, quantity } = await req.json();

  if (!itemId || typeof quantity !== 'number' || quantity < 1) {
    return NextResponse.json({ error: "Invalid itemId or quantity" }, { status: 400 });
  }

  const { error } = await supabase
    .from('cart_items')
    .update({
      quantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)
    .eq('user_id', session.user.id);

  if (error) {
    console.error("Cart PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE remove item
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', session.user.id);

  if (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

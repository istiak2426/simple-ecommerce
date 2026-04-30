import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string;

    if (!tran_id) {
      console.error("Missing tran_id in cancel callback");
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cart?payment=cancelled`);
    }

    // Update order status to 'cancelled'
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(tran_id));

    if (error) {
      console.error("Error updating order after cancel callback:", error);
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cart?payment=cancelled`);
  } catch (error) {
    console.error("Cancel callback exception:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cart?payment=cancelled`);
  }
}

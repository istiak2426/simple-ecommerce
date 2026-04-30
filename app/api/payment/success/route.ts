import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string;
    const val_id = formData.get("val_id") as string;

    if (!tran_id) {
      console.error("Missing tran_id in success callback");
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/orders?payment=error`);
    }

    // Update order status to 'paid'
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        transaction_id: val_id || tran_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(tran_id));

    if (error) {
      console.error("Error updating order after success callback:", error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/orders?payment=error`);
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/orders?payment=success`);
  } catch (error) {
    console.error("Success callback exception:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/orders?payment=error`);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string;

    if (!tran_id) {
      console.error("Missing tran_id in fail callback");
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/orders?payment=failed`);
    }

    // Update order status to 'failed'
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(tran_id));

    if (error) {
      console.error("Error updating order after fail callback:", error);
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/orders?payment=failed`);
  } catch (error) {
    console.error("Fail callback exception:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/orders?payment=failed`);
  }
}

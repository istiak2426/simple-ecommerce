import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const tran_id = formData.get("tran_id") as string;
  const val_id = formData.get("val_id") as string;

  if (tran_id) {
    await supabase
      .from('orders')
      .update({ status: 'paid', transaction_id: val_id })
      .eq('id', parseInt(tran_id));
  }
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/orders?payment=success`);
}

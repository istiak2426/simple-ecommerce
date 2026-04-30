import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string;
    const val_id = formData.get("val_id") as string;
    const status = formData.get("status") as string; // 'VALID' or 'FAILED'

    if (!tran_id) {
      console.error("Missing tran_id in IPN");
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
    }

    // Determine new status
    let newStatus = 'pending';
    if (status === 'VALID') newStatus = 'paid';
    else if (status === 'FAILED') newStatus = 'failed';

    const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
    if (val_id) updateData.transaction_id = val_id;

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', parseInt(tran_id));

    if (error) {
      console.error("IPN update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("IPN exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

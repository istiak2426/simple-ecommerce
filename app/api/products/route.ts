import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ✅ GET all products
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ✅ POST create product (admin only – add auth later)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    let image_url = null;

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      image_url = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        price,
        image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

// ✅ PUT update product
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File | null;

    if (!id || !name || !price) {
      return NextResponse.json(
        { error: "ID, name and price are required" },
        { status: 400 }
      );
    }

    const productId = parseInt(id);

    // Get existing product
    const { data: oldProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !oldProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let image_url = oldProduct.image_url;

    if (imageFile && imageFile.size > 0) {
      // Delete old image
      if (oldProduct.image_url) {
        const oldFileName = oldProduct.image_url.split("/").pop();
        if (oldFileName) {
          await supabase.storage.from("product-images").remove([oldFileName]);
        }
      }
      // Upload new
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      image_url = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        price,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Products PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// ✅ DELETE product
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const productId = parseInt(id);

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.image_url) {
      const fileName = product.image_url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("product-images").remove([fileName]);
      }
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) throw deleteError;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Products DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

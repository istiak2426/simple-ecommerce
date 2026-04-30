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

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ✅ POST create product
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price required" },
        { status: 400 }
      );
    }

    let image_url = null;

    // Upload image
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
      .insert([
        {
          name,
          price,
          image_url,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
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
      return NextResponse.json(
        { error: "ID required" },
        { status: 400 }
      );
    }

    const productId = parseInt(id);

    // Get product first
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete image if exists
    if (product.image_url) {
      const fileName = product.image_url.split("/").pop();

      await supabase.storage
        .from("product-images")
        .remove([fileName!]);
    }

    // Delete product
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
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
    const imageFile = formData.get("image") as File;

    if (!id || !name || !price) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const productId = parseInt(id);

    // Get old product
    const { data: oldProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    let image_url = oldProduct?.image_url;

    // Replace image if new one exists
    if (imageFile && imageFile.size > 0) {
      // delete old
      if (oldProduct?.image_url) {
        const oldFile = oldProduct.image_url.split("/").pop();

        await supabase.storage
          .from("product-images")
          .remove([oldFile!]);
      }

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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

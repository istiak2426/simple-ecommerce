import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import https from 'https';

// ⚠️ DEVELOPMENT ONLY: Bypass SSL verification for corporate networks
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 API Route Initialization:');
console.log('  URL:', supabaseUrl);
console.log('  Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
}

// Custom fetch function with SSL bypass
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const fetchOptions: any = {
    ...options,
    agent: httpsAgent,
  };
  
  fetchOptions.rejectUnauthorized = false;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  fetchOptions.signal = controller.signal;

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Create Supabase client with custom fetch
const supabase = createClient(
  supabaseUrl || 'missing-url',
  supabaseKey || 'missing-key',
  {
    global: {
      fetch: customFetch
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function for REST API calls (with guaranteed headers)
async function restFetch(endpoint: string, options: any = {}) {
  const baseUrl = supabaseUrl!.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;
  
  // Ensure headers are properly set
  const headers: any = {
    'apikey': supabaseKey!,
    'Authorization': `Bearer ${supabaseKey!}`,
    'Accept': 'application/json',
    ...options.headers // This is critical - it includes the Range header
  };

  // Only add Content-Type for requests with body
  if (options.body && !options.method?.match(/GET|DELETE/)) {
    headers['Content-Type'] = 'application/json';
  }

  // Log headers for debugging (hide sensitive data)
  console.log('📋 Request headers:', {
    ...headers,
    'apikey': '***',
    'Authorization': '***',
    'Range': headers['Range'] || 'not set' // Specifically log the Range header
  });

  const fetchOptions: any = {
    method: options.method || 'GET',
    headers,
    agent: httpsAgent
  };

  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' 
      ? options.body 
      : JSON.stringify(options.body);
  }

  fetchOptions.rejectUnauthorized = false;

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  fetchOptions.signal = controller.signal;

  console.log(`🌐 ${fetchOptions.method} ${url}`);

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        errorBody = 'Could not read error body';
      }
      
      console.error('❌ Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        requestHeaders: {
          ...headers,
          'apikey': '***',
          'Authorization': '***'
        }
      });

      throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    // Parse JSON response
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('❌ Request error:', {
      message: error.message,
      url,
      method: fetchOptions.method
    });
    throw error;
  }
}

// GET all products
export async function GET() {
  console.log('📦 GET /api/products called');
  
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Fetch products with Range header (using restFetch which ensures headers)
    const products = await restFetch('/rest/v1/products', {
      method: 'GET',
      headers: {
        'Range': '0-999',
        'Prefer': 'count=exact'
      }
    });

    const productList = Array.isArray(products) ? products : [];
    console.log(`✅ Found ${productList.length} products`);
    
    return NextResponse.json(productList);

  } catch (error: any) {
    console.error('❌ GET Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(req: Request) {
  console.log('📦 POST /api/products called');
  
  try {
    const formData = await req.formData();
    
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const imageFile = formData.get('image') as File;

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'File must be an image' },
            { status: 400 }
          );
        }

        // Validate file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Image must be less than 5MB' },
            { status: 400 }
          );
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Supabase Storage
        const uploadUrl = `${supabaseUrl}/storage/v1/object/product-images/${fileName}`;
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          // @ts-ignore
          agent: httpsAgent,
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`,
            'Content-Type': imageFile.type
          },
          body: buffer
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        // Get public URL
        imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${fileName}`;
        console.log('✅ Image uploaded:', imageUrl);
        
      } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image: ' + uploadError.message },
          { status: 500 }
        );
      }
    }

    // Insert product using Supabase client
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          price,
          image_url: imageUrl,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    
    console.log('✅ Product created:', newProduct.id);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error('❌ POST Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE product - FIXED VERSION with guaranteed headers
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting product with ID:', productId);

    // FIRST APPROACH: Try to get the product directly using Supabase client (more reliable)
    const { data: directProduct, error: directError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (directError) {
      console.error('❌ Direct fetch error:', directError);
      // Fall back to REST API if client fails
    }

    if (directProduct) {
      console.log('✅ Found product via direct query:', directProduct);
      
      // Delete image if exists
      if (directProduct?.image_url) {
        try {
          const fileName = directProduct.image_url.split('/').pop();
          console.log('🖼️ Deleting image:', fileName);
          
          const deleteUrl = `${supabaseUrl}/storage/v1/object/product-images/${fileName}`;
          
          await fetch(deleteUrl, {
            method: 'DELETE',
            // @ts-ignore
            agent: httpsAgent,
            headers: {
              'apikey': supabaseKey!,
              'Authorization': `Bearer ${supabaseKey!}`
            }
          });
          
          console.log('✅ Image deleted');
        } catch (imageError: any) {
          console.error('⚠️ Failed to delete image:', imageError.message);
        }
      }

      // Delete product
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      console.log('✅ Product deleted successfully');

      // Fetch remaining products
      const { data: remainingProducts } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      return NextResponse.json(remainingProducts || []);
    }

    // SECOND APPROACH: If direct query fails, try REST API with proper headers
    console.log('⚠️ Direct query failed, trying REST API...');
    
    // Get all products using REST with Range header
    const allProducts = await restFetch('/rest/v1/products', {
      method: 'GET',
      headers: {
        'Range': '0-999' // CRITICAL: This prevents 416 error
      }
    });

    const productList = Array.isArray(allProducts) ? allProducts : [];
    const availableIds = productList.map(p => p.id);
    
    console.log('📋 Available product IDs:', availableIds);

    // Find the product
    const product = productList.find(p => p.id === productId);

    if (!product) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          message: `Product with ID ${productId} does not exist`,
          availableIds: availableIds
        },
        { status: 404 }
      );
    }

    console.log('✅ Found product via REST:', product);

    // Delete image if exists
    if (product?.image_url) {
      try {
        const fileName = product.image_url.split('/').pop();
        console.log('🖼️ Deleting image:', fileName);
        
        const deleteUrl = `${supabaseUrl}/storage/v1/object/product-images/${fileName}`;
        
        await fetch(deleteUrl, {
          method: 'DELETE',
          // @ts-ignore
          agent: httpsAgent,
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`
          }
        });
        
        console.log('✅ Image deleted');
      } catch (imageError: any) {
        console.error('⚠️ Failed to delete image:', imageError.message);
      }
    }

    // Delete product using REST API
    await restFetch(`/rest/v1/products?id=eq.${productId}`, {
      method: 'DELETE'
    });

    console.log('✅ Product deleted successfully via REST');

    // Fetch remaining products
    const remainingProducts = await restFetch('/rest/v1/products', {
      method: 'GET',
      headers: {
        'Range': '0-999'
      }
    });

    const remainingList = Array.isArray(remainingProducts) ? remainingProducts : [];
    return NextResponse.json(remainingList);

  } catch (error: any) {
    console.error('❌ DELETE Error:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to delete product', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const imageFile = formData.get('image') as File | null;

    if (!id || !name || !price) {
      return NextResponse.json(
        { error: 'ID, name, and price are required' },
        { status: 400 }
      );
    }

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Get existing product
    const { data: oldProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!oldProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      name,
      price,
      updated_at: new Date().toISOString()
    };

    // Handle image update if new image provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Validate file type and size
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'File must be an image' },
            { status: 400 }
          );
        }

        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Image must be less than 5MB' },
            { status: 400 }
          );
        }

        // Delete old image if exists
        if (oldProduct?.image_url) {
          const oldFileName = oldProduct.image_url.split('/').pop();
          
          const deleteUrl = `${supabaseUrl}/storage/v1/object/product-images/${oldFileName}`;
          
          await fetch(deleteUrl, {
            method: 'DELETE',
            // @ts-ignore
            agent: httpsAgent,
            headers: {
              'apikey': supabaseKey!,
              'Authorization': `Bearer ${supabaseKey!}`
            }
          });
          
          console.log('✅ Old image deleted');
        }

        // Upload new image
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadUrl = `${supabaseUrl}/storage/v1/object/product-images/${fileName}`;
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          // @ts-ignore
          agent: httpsAgent,
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`,
            'Content-Type': imageFile.type
          },
          body: buffer
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        updateData.image_url = `${supabaseUrl}/storage/v1/object/public/product-images/${fileName}`;
        console.log('✅ New image uploaded');

      } catch (imageError: any) {
        console.error('Image handling error:', imageError);
        return NextResponse.json(
          { error: 'Failed to process image: ' + imageError.message },
          { status: 500 }
        );
      }
    }

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }
    
    console.log('✅ Product updated:', productId);
    return NextResponse.json(updatedProduct);

  } catch (error: any) {
    console.error('❌ PUT Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}
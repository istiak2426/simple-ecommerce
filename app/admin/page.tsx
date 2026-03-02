"use client";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    price: "",
    image: null as File | null,
    imagePreview: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch products from API
  // const fetchProducts = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");
      
  //     console.log('Fetching products...');
  //     const response = await fetch('/api/products');
      
  //     console.log('Response status:', response.status);
      
  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => null);
  //       console.error('Error response:', errorData);
  //       throw new Error(errorData?.error || `Failed to fetch products: ${response.status}`);
  //     }
      
  //     const data = await response.json();
  //     console.log('Fetched products:', data);
      
  //     setProducts(data);
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
  //     setError(errorMessage);
  //     console.error('Fetch error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchProducts = async () => {
  try {
    setLoading(true);
    setError("");
    
    console.log('Fetching products...');
    const response = await fetch('/api/products');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    // Try to get the response text first for debugging
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { error: responseText };
    }
    
    if (!response.ok) {
      console.error('Error response:', errorData);
      throw new Error(errorData?.error || errorData?.details || `Failed to fetch products: ${response.status}`);
    }
    
    setProducts(errorData);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
    setError(errorMessage);
    console.error('Fetch error:', err);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setFormData({
      ...formData,
      image: file,
      imagePreview: previewUrl,
    });
  };

  const handleAdd = async (): Promise<void> => {
    if (!formData.name || !formData.price || !formData.image) {
      setError('Please fill all fields and select an image');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('image', formData.image);

      console.log('Sending POST request...');
      
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('POST response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.error || 'Failed to add product');
      }

      const newProduct = await response.json();
      console.log('Product added:', newProduct);
      
      setProducts(prev => [newProduct, ...prev]);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      console.error('Add product error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product): void => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      image: null,
      imagePreview: product.image_url,
    });
    setIsEditing(true);
    setError('');
  };

  const handleUpdate = async (): Promise<void> => {
    if (!formData.name || !formData.price) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('id', formData.id.toString());
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('Sending PUT request...');
      
      const response = await fetch('/api/products', {
        method: 'PUT',
        body: formDataToSend,
      });

      console.log('PUT response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.error || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      console.log('Product updated:', updatedProduct);
      
      setProducts(prev => 
        prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      );
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      console.error('Update product error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      setError('');

      console.log('Sending DELETE request for ID:', id);
      
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      console.log('DELETE response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.error || 'Failed to delete product');
      }

      const remainingProducts = await response.json();
      console.log('Products after delete:', remainingProducts);
      
      setProducts(remainingProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      console.error('Delete product error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    // Clean up preview URL if it exists
    if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    
    setFormData({
      id: 0,
      name: "",
      price: "",
      image: null,
      imagePreview: "",
    });
    setIsEditing(false);
    setError('');
  };

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Admin Panel - Manage Products
      </h1>

      {/* Error Display */}
      {error && (
        <div className="max-w-xl mx-auto mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="max-w-xl mx-auto mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
          Loading...
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-black">
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3 text-black"
          disabled={loading}
        />

        <input
          type="text"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3 text-black"
          disabled={loading}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full border p-2 rounded mb-4 text-black"
          disabled={loading}
        />

        {/* Image Preview */}
        {formData.imagePreview && (
          <div className="mb-4">
            <img
              src={formData.imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {isEditing ? (
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          ) : (
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          )}

          <button
            onClick={resetForm}
            disabled={loading}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {products.length === 0 && !loading && (
          <p className="text-center text-black">No products available</p>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-4"
          >
            <img
              src={product.image_url || '/placeholder-image.jpg'}
              alt={product.name}
              className="w-32 h-32 object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
              }}
            />
            <div className="flex-1 w-full">
              <h3 className="text-lg font-semibold text-black">{product.name}</h3>
              <p className="text-black mb-2">{product.price}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  disabled={loading}
                  className="bg-yellow-500 text-white px-3 py-1 rounded disabled:bg-yellow-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={loading}
                  className="bg-red-600 text-white px-3 py-1 rounded disabled:bg-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
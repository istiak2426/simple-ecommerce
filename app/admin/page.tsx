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

  // 🔥 file input reset key
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/products");

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = [];
      }

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch products");
      }

      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
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

    const previewUrl = URL.createObjectURL(file);

    setFormData({
      ...formData,
      image: file,
      imagePreview: previewUrl,
    });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price || !formData.image) {
      setError("Please fill all fields and select an image");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("image", formData.image);

      const response = await fetch("/api/products", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to add product");
      }

      const newProduct = await response.json();

      setProducts((prev) => [newProduct, ...prev]);

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      image: null,
      imagePreview: product.image_url,
    });

    setIsEditing(true);
    setError("");
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.price) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formDataToSend = new FormData();

      formDataToSend.append("id", formData.id.toString());
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch("/api/products", {
        method: "PUT",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update product");
      }

      const updatedProduct = await response.json();

      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to delete product");
      }

      const remainingProducts = await response.json();

      setProducts(remainingProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(formData.imagePreview);
    }

    setFormData({
      id: 0,
      name: "",
      price: "",
      image: null,
      imagePreview: "",
    });

    setFileInputKey(Date.now()); // 🔥 reset file input

    setIsEditing(false);
    setError("");
  };

  useEffect(() => {
    return () => {
      if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Admin Panel - Manage Products
      </h1>

      {error && (
        <div className="max-w-xl mx-auto mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="max-w-xl mx-auto mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
          Loading...
        </div>
      )}

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
        />

        <input
          type="text"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3 text-black"
        />

        <input
          key={fileInputKey}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full border p-2 rounded mb-4 text-black"
        />

        {formData.imagePreview && (
          <div className="mb-4">
            <img
              src={formData.imagePreview}
              className="w-32 h-32 object-cover rounded"
            />
          </div>
        )}

        <div className="flex gap-3">
          {isEditing ? (
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          )}

          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow-md flex gap-4"
          >
            <img
              src={product.image_url}
              className="w-32 h-32 object-cover rounded"
            />

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-black">
                {product.name}
              </h3>

              <p className="text-black">{product.price}</p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
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

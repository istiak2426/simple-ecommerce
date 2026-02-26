"use client";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string; // base64 string
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Product>({
    id: 0,
    name: "",
    price: "",
    image: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Load from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        image: reader.result as string, // base64 string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = (): void => {
    if (!formData.name || !formData.price || !formData.image) return;

    const newProduct: Product = {
      ...formData,
      id: Date.now(),
    };

    setProducts((prev) => [...prev, newProduct]);
    resetForm();
  };

  const handleEdit = (product: Product): void => {
    setFormData(product);
    setIsEditing(true);
  };

  const handleUpdate = (): void => {
    setProducts((prev) =>
      prev.map((p) => (p.id === formData.id ? formData : p))
    );
    resetForm();
  };

  const handleDelete = (id: number): void => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const resetForm = (): void => {
    setFormData({ id: 0, name: "", price: "", image: "" });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        Admin Panel - Manage Products
      </h1>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10 max-w-xl mx-auto">
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

        {/* File Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full border p-2 rounded mb-4 text-black"
        />

        {/* Image Preview */}
        {formData.image && (
          <img
            src={formData.image}
            alt="Preview"
            className="w-32 h-32 object-cover rounded mb-4"
          />
        )}

        <div className="flex flex-wrap gap-3">
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-4 text-black">Image</th>
              <th className="p-4 text-black">Name</th>
              <th className="p-4 text-black">Price</th>
              <th className="p-4 text-black">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="p-4 text-black">{product.name}</td>
                <td className="p-4 text-black">{product.price}</td>
                <td className="p-4 space-x-3">
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
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-6 text-black">
                  No products available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

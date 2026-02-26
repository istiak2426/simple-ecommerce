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

  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        image: reader.result as string,
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Admin Panel - Manage Products
      </h1>

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
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full border p-2 rounded mb-4 text-black"
        />

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

      {/* Product List */}
      <div className="space-y-4">
        {products.length === 0 && (
          <p className="text-center text-black">No products available</p>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-4"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-32 h-32 object-cover rounded"
            />
            <div className="flex-1 w-full">
              <h3 className="text-lg font-semibold text-black">{product.name}</h3>
              <p className="text-black mb-2">{product.price}</p>
              <div className="flex flex-wrap gap-2">
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

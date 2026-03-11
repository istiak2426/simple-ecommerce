"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string;
  description?: string;
}

export default function Home() {

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black">

      {/* NAVBAR */}

      <nav className="flex justify-between items-center px-6 md:px-10 py-4 bg-white shadow sticky top-0 z-40">

        <h1 className="text-2xl font-bold">ShopEasy</h1>

        <div className="hidden md:flex gap-8">
          <a className="hover:text-gray-700 cursor-pointer">Home</a>
          <a className="hover:text-gray-700 cursor-pointer">Products</a>
          <a className="hover:text-gray-700 cursor-pointer">Contact</a>
        </div>

        <div className="relative">
          <button className="bg-black text-white px-4 py-2 rounded-lg">
            Cart
          </button>

          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {cart.length}
            </span>
          )}
        </div>

      </nav>

      {/* HERO */}

      <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-20 text-center px-4">

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Premium Motorcycle Oils
        </h2>

        <p className="mb-8 text-lg max-w-2xl mx-auto">
          Keep your engine smooth with our high performance oils designed for durability and efficiency.
        </p>

        <button className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition">
          Shop Now
        </button>

      </section>

      {/* PRODUCTS */}

      <section className="px-6 md:px-10 py-16 max-w-7xl mx-auto">

        <h3 className="text-3xl font-bold text-center mb-12">
          Featured Products
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

          {products.map((product) => (

            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition cursor-pointer group"
            >

              <div className="overflow-hidden rounded-t-2xl">

                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                />

              </div>

              <div className="p-6 text-center">

                <h4 className="font-semibold text-lg mb-2">
                  {product.name}
                </h4>

                <p className="text-gray-700 mb-4">
                  {product.price}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  Add to Cart
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* PRODUCT MODAL */}

      {selectedProduct && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 md:p-8 relative flex flex-col md:flex-row gap-8">

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 text-2xl"
            >
              ×
            </button>

            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="w-full md:w-1/2 h-80 md:h-96 object-cover rounded-xl"
            />

            <div className="flex flex-col justify-between">

              <div>

                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {selectedProduct.name}
                </h2>

                <p className="text-xl mb-4">
                  {selectedProduct.price}
                </p>

                <p className="text-gray-700">
                  {selectedProduct.description ||
                    "High performance oil designed for smooth engine performance."}
                </p>

              </div>

              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Add To Cart
              </button>

            </div>

          </div>

        </div>

      )}

      {/* FOOTER */}

      <footer className="bg-black text-white text-center py-8 mt-20">

        <p className="text-gray-300">
          © 2026 ShopEasy. All rights reserved.
        </p>

      </footer>

    </main>
  );
}

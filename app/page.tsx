"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string;
  description?: string;
  quantity?: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: (p.quantity || 1) + qty } : p
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setIsCartOpen(true);
    setQuantity(1);
  };

  const handleRemoveFromCart = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPrice = cart
    .reduce(
      (sum, item) =>
        sum + (parseFloat(item.price.replace("$", "")) * (item.quantity || 1)),
      0
    )
    .toFixed(2);

  const getProductQuantity = (id: number) => {
    const item = cart.find((p) => p.id === id);
    return item?.quantity || 0;
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white relative">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-4 md:px-10 py-4 bg-gray-800 shadow sticky top-0 z-50">
        <h1 className="text-2xl font-bold">ShopEasy</h1>

        <div className="flex items-center gap-3 md:gap-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 hidden md:block"
          />
          <button
            className="relative bg-black text-white px-4 py-2 rounded-lg md:px-6 md:py-3"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {cart.reduce((sum, p) => sum + (p.quantity || 1), 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-r from-gray-700 to-gray-800 py-16 text-center px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Premium Motorcycle Oils
        </h2>
        <p className="mb-6 text-base md:text-lg max-w-2xl mx-auto text-gray-300">
          Keep your engine smooth with our high performance oils.
        </p>
        <button className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-900 transition">
          Shop Now
        </button>
      </section>

      {/* PRODUCTS */}
      <section className="px-4 md:px-10 py-10 max-w-7xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Featured Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition cursor-pointer group relative overflow-hidden"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-56 md:h-64 object-cover group-hover:scale-105 transition duration-500 rounded-t-xl"
              />

              {/* CART QUANTITY BADGE */}
              {getProductQuantity(product.id) > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                  {getProductQuantity(product.id)}
                </span>
              )}

              <div className="p-4 text-center">
                <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
                <p className="text-gray-300 mb-3">{product.price}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product, 1);
                  }}
                  className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-3xl p-6 md:p-8 relative flex flex-col md:flex-row gap-6">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-2xl text-white"
            >
              ×
            </button>

            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="w-full md:w-1/2 h-64 md:h-96 object-cover rounded-xl"
            />

            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <p className="text-gray-300 mb-3">{selectedProduct.price}</p>
                <p className="text-gray-400 text-sm md:text-base">
                  {selectedProduct.description || "High performance oil for motorcycles."}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  -
                </button>
                <span className="text-white font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  +
                </button>
                <button
                  onClick={() => handleAddToCart(selectedProduct, quantity)}
                  className="ml-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                  Add {quantity}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Your Cart</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-2xl text-white">
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 && <p className="text-gray-400">Cart is empty</p>}
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="text-gray-300">
                    ${item.price} x {item.quantity || 1} = $
                    {((parseFloat(item.price.replace("$", "")) || 0) *
                      (item.quantity || 1)
                    ).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="mt-4">
              <p className="font-bold mb-2 text-white">Total: ${totalPrice}</p>
              <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition">
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-12">
        <p className="text-gray-400">© 2026 ShopEasy. All rights reserved.</p>
      </footer>
    </main>
  );
}

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

  return (
    <main className="min-h-screen bg-gray-50 text-black relative">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 md:px-10 py-4 bg-white shadow sticky top-0 z-50">
        <h1 className="text-2xl font-bold">ShopEasy</h1>

        <div className="hidden md:flex items-center gap-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            className="relative bg-black text-white px-4 py-2 rounded-lg"
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
      <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-20 text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Premium Motorcycle Oils
        </h2>
        <p className="mb-8 text-lg max-w-2xl mx-auto">
          Keep your engine smooth with our high performance oils.
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
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition cursor-pointer group relative overflow-hidden"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="p-6 text-center">
                <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                <p className="text-gray-700 mb-4">{product.price}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product, 1);
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
                <p className="text-xl mb-4">{selectedProduct.price}</p>
                <p className="text-gray-700">
                  {selectedProduct.description ||
                    "High performance oil designed for smooth engine performance."}
                </p>
              </div>

              {/* QUANTITY SELECTOR */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => handleAddToCart(selectedProduct, quantity)}
                  className="ml-auto bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
                >
                  Add {quantity} to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-2xl">
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 && <p className="text-gray-500">Cart is empty</p>}
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{item.name}</h4>
                  <p>
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
              <p className="font-bold mb-2">Total: ${totalPrice}</p>
              <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-white text-center py-8 mt-20">
        <p className="text-gray-300">© 2026 ShopEasy. All rights reserved.</p>
      </footer>
    </main>
  );
}

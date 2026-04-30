"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string;
  description?: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Fetch products
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);

    // Fetch cart count if logged in
    if (session) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => {
          const totalItems = data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          setCartCount(totalItems);
        })
        .catch(console.error);
    }
  }, [session]);

  const addToCart = async (product: Product, qty: number) => {
    if (!session) {
      router.push("/login");
      return;
    }
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: qty }),
    });
    if (res.ok) {
      // Update cart count
      const cartRes = await fetch("/api/cart");
      const cartData = await cartRes.json();
      const totalItems = cartData.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
      setCartCount(totalItems);
      setSelectedProduct(null);
      setQuantity(1);
    } else {
      alert("Failed to add to cart");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white relative">
      <nav className="flex justify-between items-center px-4 md:px-10 py-4 bg-gray-800 shadow sticky top-0 z-50">
        <h1 className="text-2xl font-bold">RS Automotive</h1>
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
            onClick={() => router.push("/cart")}
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          {session ? (
            <button onClick={() => router.push("/orders")} className="text-sm bg-gray-700 px-3 py-2 rounded">
              Orders
            </button>
          ) : (
            <button onClick={() => router.push("/login")} className="text-sm bg-gray-700 px-3 py-2 rounded">
              Login
            </button>
          )}
        </div>
      </nav>

      <section className="bg-gradient-to-r from-gray-700 to-gray-800 py-16 text-center px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Premium Motorcycle Oil</h2>
        <p className="mb-6 text-base md:text-lg max-w-2xl mx-auto text-gray-300">
          Keep your engine smooth with our high performance oils.
        </p>
      </section>

      <section className="px-4 md:px-10 py-10 max-w-7xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Featured Products</h3>
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
              <div className="p-4 text-center">
                <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
                <p className="text-gray-300 mb-3">{product.price}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, 1);
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

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-3xl p-6 md:p-8 relative flex flex-col md:flex-row gap-6">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 text-2xl text-white">
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
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">-</button>
                <span className="text-white font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">+</button>
                <button onClick={() => addToCart(selectedProduct, quantity)} className="ml-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition">
                  Add {quantity}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white text-center py-6 mt-12">
        <p className="text-gray-400">© 2026 RS Automotive. All rights reserved.</p>
      </footer>
    </main>
  );
}

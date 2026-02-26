"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // fallback products for mobile/test
      setProducts([
        { id: 1, name: "Flamingo 20W-50", price: "$12", image: "/images/1.jpeg" },
        { id: 2, name: "Flamingo 10W-40", price: "$18", image: "/images/2.jpeg" },
        { id: 3, name: "Engine Oil A", price: "$15", image: "/images/3.jpeg" },
        { id: 4, name: "Engine Oil B", price: "$16", image: "/images/4.jpeg" },
      ]);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">
          ShopEasy
        </h1>

        {/* Desktop Menu */}
        <div className="space-x-6 hidden md:block">
          <a href="#" className="text-black hover:text-gray-800">
            Home
          </a>
          <a href="#" className="text-black hover:text-gray-800">
            Products
          </a>
          <a href="#" className="text-black hover:text-gray-800">
            Contact
          </a>
        </div>

        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          Cart
        </button>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-16 md:py-20 px-6 bg-gradient-to-r from-gray-100 to-gray-200">
        <h2 className="text-3xl md:text-6xl font-bold text-black mb-6">
          Discover Amazing Products
        </h2>

        <p className="text-black text-base md:text-lg mb-8">
          Quality motorcycle oils at the best prices.
        </p>

        <button className="bg-black text-white px-6 py-3 rounded-xl text-lg hover:bg-gray-800">
          Shop Now
        </button>
      </section>

      {/* Product Section */}
      <section className="px-6 md:px-8 py-12 md:py-16">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-black mb-10 md:mb-12">
          Featured Products
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
          {products.length === 0 && (
            <p className="text-center text-black col-span-full">
              No products found
            </p>
          )}

          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 md:h-64 object-cover"
              />

              <div className="p-5 md:p-6 text-center">
                <h4 className="text-lg md:text-xl font-semibold mb-2 text-black">
                  {product.name}
                </h4>

                <p className="mb-4 text-base md:text-lg text-black">
                  {product.price}
                </p>

                <button className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white text-center py-6 mt-10">
        <p>© 2026 ShopEasy. All rights reserved.</p>
      </footer>

    </main>
  );
}

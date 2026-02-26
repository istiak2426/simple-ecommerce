"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string; // URL or base64
  description?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts([
        {
          id: 1,
          name: "Flamingo 20W-50",
          price: "$12",
          image: "/images/1.jpeg",
          description: "High-quality 4-stroke motorcycle oil, 1L.",
        },
        {
          id: 2,
          name: "Flamingo 10W-40",
          price: "$18",
          image: "/images/2.jpeg",
          description: "Premium synthetic oil for motorcycles, 1L.",
        },
      ]);
    }
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
    alert(`${product.name} added to cart!`);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">ShopEasy</h1>
        <div className="space-x-6 hidden md:block">
          <a href="#" className="text-black hover:text-gray-800">Home</a>
          <a href="#" className="text-black hover:text-gray-800">Products</a>
          <a href="#" className="text-black hover:text-gray-800">Contact</a>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          Cart ({cart.length})
        </button>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-6 bg-gradient-to-r from-gray-100 to-gray-200">
        <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">
          Discover Amazing Products
        </h2>
        <p className="text-black text-lg mb-8">
          Quality motorcycle oils at the best prices.
        </p>
        <button className="bg-black text-white px-6 py-3 rounded-xl text-lg hover:bg-gray-800">
          Shop Now
        </button>
      </section>

      {/* Product Section */}
      <section className="px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-black mb-12">
          Featured Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold mb-2 text-black">{product.name}</h4>
                <p className="text-black mb-4">{product.price}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                  className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative flex flex-col md:flex-row gap-6">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-black text-2xl font-bold"
            >
              ×
            </button>

            {/* Product Image */}
            <div className="flex-1">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-80 object-cover rounded"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">{selectedProduct.name}</h3>
                <p className="text-black mb-2">Price: {selectedProduct.price}</p>
                {selectedProduct.description && (
                  <p className="text-black mb-4">{selectedProduct.description}</p>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="bg-black text-white px-6 py-3 rounded-lg w-full hover:bg-gray-800 transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white text-center py-6 mt-10">
        <p>© 2026 ShopEasy. All rights reserved.</p>
      </footer>
    </main>
  );
}

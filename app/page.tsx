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
      .then((data) => {
        console.log("Products from API:", data);
        setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to fetch products", err);
      });
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
        <button className="bg-black text-white px-4 py-2 rounded-lg">
          Cart ({cart.length})
        </button>
      </nav>

      {/* Product Section */}
      <section className="px-8 py-16">

        <h3 className="text-3xl font-bold text-center text-black mb-12">
          Featured Products
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

          {products.map((product) => (

            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >

              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover"
              />

              <div className="p-6 text-center">

                <h4 className="text-xl font-semibold text-black">
                  {product.name}
                </h4>

                <p className="text-black mb-4">{product.price}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="bg-black text-white px-5 py-2 rounded-lg"
                >
                  Add to Cart
                </button>

              </div>
            </div>

          ))}

        </div>

      </section>

      {/* Product Modal */}

      {selectedProduct && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white rounded-xl max-w-3xl w-full p-6 relative flex gap-6">

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-2xl"
            >
              ×
            </button>

            <img
              src={selectedProduct.image_url}
              className="w-1/2 h-80 object-cover rounded"
            />

            <div className="flex flex-col justify-between">

              <div>

                <h3 className="text-2xl font-bold text-black">
                  {selectedProduct.name}
                </h3>

                <p className="text-black mb-2">
                  Price: {selectedProduct.price}
                </p>

                {selectedProduct.description && (
                  <p className="text-black">
                    {selectedProduct.description}
                  </p>
                )}

              </div>

              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="bg-black text-white px-6 py-3 rounded-lg"
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

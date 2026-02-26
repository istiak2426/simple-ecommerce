export default function Home() {
  const products = [
    { id: 1, name: "Flamingo 20W-50", price: "$12", image: "/images/1.jpeg" },
    { id: 2, name: "Flamingo 10W-40", price: "$18", image: "/images/2.jpeg" },
    { id: 3, name: "Engine Oil A", price: "$15", image: "/images/3.jpeg" },
    { id: 4, name: "Engine Oil B", price: "$16", image: "/images/4.jpeg" },
    { id: 5, name: "Engine Oil C", price: "$20", image: "/images/5.jpeg" },
    { id: 6, name: "Engine Oil D", price: "$22", image: "/images/6.jpeg" },
    { id: 7, name: "Engine Oil E", price: "$19", image: "/images/7.jpeg" },
    { id: 8, name: "Engine Oil F", price: "$25", image: "/images/8.jpeg" },
    { id: 9, name: "Engine Oil G", price: "$17", image: "/images/9.jpeg" },
    { id: 10, name: "Engine Oil H", price: "$21", image: "/images/10.jpeg" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">ShopEasy</h1>

        <div className="space-x-6 hidden md:block">
          <a href="#" className="text-gray-600 hover:text-black">Home</a>
          <a href="#" className="text-gray-600 hover:text-black">Products</a>
          <a href="#" className="text-gray-600 hover:text-black">Contact</a>
        </div>

        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          Cart
        </button>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-r from-gray-100 to-gray-200">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Discover Amazing Products
        </h2>

        <p className="text-gray-600 text-lg mb-8">
          Quality motorcycle oils at the best prices.
        </p>

        <button className="bg-black text-white px-6 py-3 rounded-xl text-lg hover:bg-gray-800">
          Shop Now
        </button>
      </section>

      {/* Product Section */}
      <section className="px-8 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">
          Featured Products
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover"
              />

              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold mb-2">
                  {product.name}
                </h4>

                <p className="text-gray-600 mb-4">
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
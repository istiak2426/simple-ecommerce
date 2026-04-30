"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  quantity: number;
  product_id: number;
  products: {
    id: number;
    name: string;
    price: string;
    image_url: string;
  };
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    fetchCart();
  }, [session]);

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCartItems(data.items || []);
    setLoading(false);
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity: newQuantity }),
    });
    fetchCart();
  };

  const removeItem = async (itemId: number) => {
    await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
    fetchCart();
  };

  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.products.price);
    return sum + price * item.quantity;
  }, 0);

  if (loading) return <div className="text-center text-white p-10">Loading cart...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty. <a href="/" className="text-blue-400">Continue shopping</a></p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
                  <img src={item.products.image_url} alt={item.products.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.products.name}</h3>
                    <p className="text-gray-300">{item.products.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 bg-gray-700 rounded">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 bg-gray-700 rounded">+</button>
                      <button onClick={() => removeItem(item.id)} className="ml-4 text-red-400">Remove</button>
                    </div>
                  </div>
                  <div className="text-right">
                    ৳{(parseFloat(item.products.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <p className="text-xl font-bold">Total: ৳{total.toFixed(2)}</p>
              <button onClick={() => router.push("/checkout")} className="mt-4 bg-green-600 px-6 py-2 rounded hover:bg-green-700">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

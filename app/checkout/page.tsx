"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    shippingAddress: "",
    phone: "",
    paymentMethod: "sslcommerz",
  });
  const [loading, setLoading] = useState(false);

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl; // SSLCommerz gateway
    } else if (data.orderId) {
      router.push("/orders?success=true");
    } else {
      alert("Order failed: " + (data.error || "Unknown error"));
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Shipping Address</label>
            <input
              type="text"
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={form.shippingAddress}
              onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-1">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-1">Payment Method</label>
            <select
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="sslcommerz">SSLCommerz (Card, Mobile Banking, etc.)</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>
      </div>
    </main>
  );
}

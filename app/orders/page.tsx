"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  products: { name: string; image_url: string };
}

interface Order {
  id: number;
  total_price: string;
  status: string;
  payment_method: string;
  shipping_address: string;
  phone: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [session]);

  if (loading) return <div className="text-center text-white p-10">Loading orders...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <p>No orders yet. <a href="/" className="text-blue-400">Start shopping</a></p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start border-b border-gray-700 pb-2">
                  <div>
                    <p className="text-sm text-gray-400">Order #{order.id}</p>
                    <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.status === 'paid' ? 'bg-green-800' : 
                    order.status === 'failed' ? 'bg-red-800' : 'bg-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>{item.products.name}</span>
                        <span className="text-gray-400">x{item.quantity}</span>
                      </div>
                      <span>৳{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-700">
                  <p className="text-sm">Payment: {order.payment_method}</p>
                  <p className="text-sm">Address: {order.shipping_address}</p>
                  <p className="text-sm">Phone: {order.phone}</p>
                  <p className="text-lg font-bold mt-2">Total: ৳{order.total_price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

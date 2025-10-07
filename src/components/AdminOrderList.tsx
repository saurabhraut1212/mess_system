'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface OrderItem {
  _id: string;
  user: { name: string; email: string };
  items: { menuId: { name: string }; quantity: number; instructions?: string }[];
  status: string;
  totalPrice: number;
}

const statuses = ['pending','preparing','out-for-delivery','delivered','cancelled'];

export default function AdminOrderList() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) setOrders(data);
      else toast.error(data.error || 'Failed to fetch orders');
    } catch {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    // Delay ensures context has time to propagate
    const timer = setTimeout(() => fetchOrders(), 200);
    return () => clearTimeout(timer);
  }, [token]);

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch('/api/orders/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, status }),
    });
    const data = await res.json();

    if (res.ok) {
      toast.success(data.message);
      fetchOrders();
    } else {
      toast.error(data.error || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600">Loading orders...</div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4">Admin: Manage Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="border p-4 rounded shadow">
              <p><strong>User:</strong> {order.user.name} ({order.user.email})</p>
              <p><strong>Total:</strong> ₹{order.totalPrice}</p>
              <p><strong>Status:</strong> {order.status}</p>

              <div className="mt-2">
                {order.items.map((item, index) => (
                  <p key={`${order._id}-${index}`}>
                    {item.menuId?.name} x {item?.quantity}
                    {item?.instructions && ` (${item?.instructions})`}
                  </p>
                ))}
              </div>

              <div className="mt-2 flex gap-2 flex-wrap">
                {statuses.map(statusOption => (
                  <button
                    key={statusOption}
                    disabled={statusOption === order.status}
                    onClick={() => updateStatus(order._id, statusOption)}
                    className={`px-3 py-1 rounded text-white ${
                      statusOption === 'pending'
                        ? 'bg-gray-500'
                        : statusOption === 'preparing'
                        ? 'bg-yellow-500'
                        : statusOption === 'out-for-delivery'
                        ? 'bg-blue-500'
                        : statusOption === 'delivered'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    } disabled:opacity-50`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

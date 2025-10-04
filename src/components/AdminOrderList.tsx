'use client';

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
  const [orders, setOrders] = useState<OrderItem[]>([]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/orders/list', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setOrders(data);
    else toast.error(data.error || 'Failed to fetch orders');
  };

  useEffect(() => { fetchOrders(); }, []);

  console.log(orders, "orders");
  const updateStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('token');
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

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4">Admin: Manage Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="border p-4 rounded shadow">
            <p><strong>User:</strong> {order.user.name} ({order.user.email})</p>
            <p><strong>Total:</strong> ₹{order.totalPrice}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <div className="mt-2">
              {order.items.map((item) => (
                <p key={order._id}>{item.menuId.name} x {item.quantity} {item.instructions && `(${item.instructions})`}</p>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {statuses.map(statusOption => (
                <button
                  key={statusOption}
                  disabled={statusOption === order.status}
                  onClick={() => updateStatus(order._id, statusOption)}
                  className={`px-2 py-1 rounded text-white ${statusOption === 'pending' ? 'bg-gray-500' :
                    statusOption === 'preparing' ? 'bg-yellow-500' :
                    statusOption === 'out-for-delivery' ? 'bg-blue-500' :
                    statusOption === 'delivered' ? 'bg-green-500' :
                    'bg-red-500'} disabled:opacity-50`}
                >
                  {statusOption}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

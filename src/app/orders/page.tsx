'use client';

import { useEffect, useState } from 'react';
import OrderForm from '@/components/OrderForm';
import toast, { Toaster } from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  dietaryInfo?: string;
  date: string;
}

interface OrderItem {
  menuId: MenuItem;
  quantity: number;
  instructions?: string;
  addons?: string[];
}

interface Order {
  _id: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  totalPrice: number;
}

interface ApiResponse<T> {
  error?: string;
  message?: string;
  data?: T;
}

export default function OrdersPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchMenu = async () => {
    const res = await fetch('/api/menu/list');
    const data: MenuItem[] = await res.json();
    setMenuItems(data);
  };

 const fetchOrders = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/orders/list', { headers: { Authorization: `Bearer ${token}` } });

  if (!res.ok) {
    const errorData: ApiResponse<null> = await res.json();
    toast.error(errorData.error || 'Failed to fetch orders');
    return;
  }

  const data: Order[] = await res.json();
  setOrders(data);
};

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <OrderForm menuItems={menuItems} onSuccess={fetchOrders} />

      <h2 className="text-xl font-bold mt-8 mb-4">Your Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="border p-4 rounded shadow">
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.totalPrice}</p>
            <div className="mt-2">
              {order.items.map((item) => (
                <div key={item.menuId._id} className="border-t pt-2 mt-2">
                  <p>{item.menuId.name} x {item.quantity}</p>
                  {item.instructions && <p>Instructions: {item.instructions}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

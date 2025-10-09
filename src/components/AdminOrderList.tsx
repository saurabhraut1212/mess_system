'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface DeliveryBoy {
  _id: string;
  name: string;
  email: string;
}

interface OrderItem {
  _id: string;
  user: { name: string; email: string };
  items: { menuId: { name: string }; quantity: number; instructions?: string }[];
  status: string;
  totalPrice: number;
  createdAt: string;
}

const statuses = ['accepted', 'rejected'];

export default function AdminOrderList() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>([]);
  const [filterType, setFilterType] = useState<'date' | 'month' | 'year'>('date');
  const [filterValue, setFilterValue] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // ✅ Fetch all orders
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
        applyFilters(data, filterType, filterValue);
      } else {
        toast.error(data.error || 'Failed to fetch orders');
      }
    } catch {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch delivery boys
  const fetchDeliveryBoys = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/delivery-boys', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setDeliveryBoys(data);
    } catch {
      toast.error('Error fetching delivery boys');
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchOrders();
    fetchDeliveryBoys();
  }, [token]);

  // ✅ Filter logic
  const applyFilters = (allOrders: OrderItem[], type: string, value: string) => {
    let filtered: OrderItem[] = [];
    if (type === 'date') {
      filtered = allOrders.filter(
        (o) => new Date(o.createdAt).toISOString().slice(0, 10) === value
      );
    } else if (type === 'month') {
      filtered = allOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        const orderMonth = orderDate.getMonth() + 1;
        const orderYear = orderDate.getFullYear();
        const [year, month] = value.split('-');
        return orderYear === +year && orderMonth === +month;
      });
    } else if (type === 'year') {
      filtered = allOrders.filter(
        (o) => new Date(o.createdAt).getFullYear().toString() === value
      );
    }
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    applyFilters(orders, filterType, filterValue);
  }, [filterType, filterValue]);

  console.log(deliveryBoys,'deliveryBoys');

  // ✅ Update order status (Accept / Reject)
  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch('/api/orders/admin-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

  // ✅ Assign delivery boy
  const assignDeliveryBoy = async (orderId: string, deliveryBoyId: string) => {
    const res = await fetch('/api/orders/assign-delivery', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, deliveryBoyId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchOrders();
    } else {
      toast.error(data.error || 'Assignment failed');
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading orders...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
     

      {/* ✅ Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Orders</h2>
        <div className="flex gap-3 flex-wrap">
          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'date' | 'month' | 'year')}
            className="border p-2 rounded bg-white"
          >
            <option value="date">By Date</option>
            <option value="month">By Month</option>
            <option value="year">By Year</option>
          </select>

          {/* Filter Value (Dynamic Input) */}
          {filterType === 'date' && (
            <input
              type="date"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="border p-2 rounded bg-white"
            />
          )}
          {filterType === 'month' && (
            <input
              type="month"
              value={filterValue.slice(0, 7)}
              onChange={(e) => setFilterValue(e.target.value)}
              className="border p-2 rounded bg-white"
            />
          )}
          {filterType === 'year' && (
            <input
              type="number"
              min="2000"
              max="2100"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="border p-2 rounded bg-white w-28"
            />
          )}
        </div>
      </div>

      {/* ✅ Orders Display */}
      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 italic">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="border p-4 rounded bg-white shadow">
              <p>
                <strong>User:</strong> {order.user.name} ({order.user.email})
              </p>
              <p><strong>Total:</strong> ₹{order.totalPrice}</p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>

              <div className="mt-2 text-sm">
                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.menuId?.name} × {item.quantity}
                  </p>
                ))}
              </div>

              {/* ✅ Status Actions */}
              {order.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(order._id, s)}
                      className={`px-3 py-1 rounded text-white ${
                        s === 'accepted' ? 'bg-green-600' : 'bg-red-500'
                      } hover:opacity-90`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* ✅ Delivery Assignment */}
              {order.status === 'accepted' && (
                <div className="mt-4">
                  <label className="block mb-1 font-medium">Assign Delivery Boy:</label>
                  <select
                    onChange={(e) => assignDeliveryBoy(order._id, e.target.value)}
                    defaultValue=""
                    className="border p-2 rounded bg-white"
                  >
                    <option value="" disabled>Select delivery boy</option>
                    {deliveryBoys.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

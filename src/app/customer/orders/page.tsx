'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface OrderItem {
  menuId: MenuItem;
  quantity: number;
  instructions?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  totalPrice: number;
  createdAt: string;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Filter state
  const [filterType, setFilterType] = useState<'date' | 'month' | 'year'>('date');
  const [filterValue, setFilterValue] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return today;
  });

  // ✅ Fetch orders
  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/orders/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
        applyFilters(data, filterType, filterValue);
      } else toast.error(data.error || 'Failed to fetch orders');
    } catch {
      toast.error('Server error while fetching orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Apply filters
  const applyFilters = (allOrders: Order[], type: string, value: string) => {
    let filtered: Order[] = [];

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

  // ✅ Submit Feedback
  const handleFeedbackSubmit = async () => {
    if (!selectedOrder) return;
    if (!rating) return toast.error('Please provide a rating');

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      await Promise.all(
        selectedOrder.items.map(async (item) => {
          const res = await fetch('/api/feedback/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              order: selectedOrder._id,
              menu: item.menuId._id,
              rating,
              comment,
            }),
          });
          if (!res.ok) throw new Error('Feedback failed');
        })
      );

      toast.success('Feedback submitted successfully!');
      setSelectedOrder(null);
      setRating(0);
      setComment('');
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error('Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
  const token = localStorage.getItem('token');
  if (!token) return toast.error('Unauthorized');
  
  if (!confirm('Are you sure you want to cancel this order?')) return;

  try {
    const res = await fetch('/api/orders/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();

    if (res.ok) {
      toast.success(data.message);
      fetchOrders();
    } else {
      toast.error(data.error || 'Failed to cancel order');
    }
  } catch {
    toast.error('Server error');
  }
};

console.log(filteredOrders,"filteredOrders");


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      

      {/* ✅ Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Orders</h2>
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

      {/* ✅ Orders List */}
   {/* ✅ Orders List */}
{filteredOrders.length === 0 ? (
  <p className="text-gray-500 italic">No orders found for this filter.</p>
) : (
  <div className="space-y-4">
    {filteredOrders.map((order) => (
      <div
        key={order._id}
        className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition"
      >
        <p>
          <strong>Status:</strong>{' '}
          <span
            className={`${
              order.status === 'delivered'
                ? 'text-green-600'
                : order.status === 'cancelled'
                ? 'text-red-500'
                : 'text-yellow-600'
            } font-medium`}
          >
            {order.status}
          </span>
        </p>
        <p>
          <strong>Total:</strong> ₹{order.totalPrice}
        </p>

        <div className="mt-3">
          {order.items.map((item) => (
            <div
              key={item?.menuId?._id}
              className="border-t pt-2 mt-2 text-sm text-gray-700"
            >
              <p>
                {item.menuId?.name} × {item?.quantity}
              </p>
              {item?.instructions && (
                <p className="text-gray-500">
                  Instructions: {item.instructions}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ✅ Cancel button for pending orders */}
        {order.status === 'pending' && (
          <div className="mt-3">
            <button
              onClick={() => handleCancelOrder(order._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Cancel Order
            </button>
          </div>
        )}

        {/* ✅ Feedback for delivered orders */}
        {order.status === 'delivered' && (
          <div className="mt-4">
            <button
              onClick={() => setSelectedOrder(order)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Give Feedback
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
)}


      {/* ✅ Feedback Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
              Feedback for Order #{selectedOrder._id.slice(-5)}
            </h3>

            {/* ⭐ Rating */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* 💬 Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your feedback..."
              className="w-full p-3 border rounded-md text-sm"
              rows={4}
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

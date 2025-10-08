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
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Orders
  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/orders/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOrders(data);
      else toast.error(data.error || 'Failed to fetch orders');
    } catch {
      toast.error('Server error while fetching orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Handle Feedback Submit
  const handleFeedbackSubmit = async () => {
    if (!selectedOrder) return;
    if (!rating) {
      toast.error('Please provide a rating');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // Submit feedback for each menu in this order
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

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 italic">No orders placed yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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

              {/* ✅ Feedback button for delivered orders */}
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

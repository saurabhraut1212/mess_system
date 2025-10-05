'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface OrderInfo {
  _id: string;
  totalPrice: number;
  status: string;
  items: {
    menuId: { _id: string; name: string; price: number; category?: string };
    quantity: number;
    instructions?: string;
    addons?: string[];
  }[];
}


interface Assignment {
  _id: string;
  order: OrderInfo;
  status: 'assigned' | 'picked-up' | 'delivered';
  deliveryBoy: string;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // 🔹 Fetch assigned orders for delivery staff
  const fetchAssignments = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const res = await fetch('/api/delivery/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error('Failed to fetch assignments');
        return;
      }

      const data: Assignment[] = await res.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Network error while fetching assignments');
    }
  };

  // 🔹 Update delivery status
  const updateStatus = async (
    assignmentId: string,
    status: Assignment['status']
  ): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Unauthorized');
      return;
    }

    try {
      const res = await fetch('/api/delivery/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignmentId, status }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to update status');
        return;
      }

      toast.success('Status updated successfully');
      fetchAssignments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Network error while updating status');
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  console.log(assignments,'assignments');

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">🚚 Delivery Dashboard</h1>

      {assignments.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">
          No assigned orders yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="border p-4 rounded-lg shadow bg-white"
            >
              <h3 className="font-semibold">
                Order #{assignment.order?._id?.slice(-6) || 'N/A'}
              </h3>
              <p>Status: {assignment.status}</p>
              <p>Amount: ₹{assignment.order?.totalPrice}</p>

              <div className="mt-3">
                <h4 className="font-medium mb-1">Items:</h4>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  {assignment?.order?.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.menuId.name} × {item.quantity} — ₹{item.menuId.price}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => updateStatus(assignment._id, 'picked-up')}
                  disabled={
                    assignment.status === 'picked-up' ||
                    assignment.status === 'delivered'
                  }
                  className={`px-3 py-1 rounded text-white transition ${
                    assignment.status === 'picked-up' ||
                    assignment.status === 'delivered'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  Picked Up
                </button>

                <button
                  onClick={() => updateStatus(assignment._id, 'delivered')}
                  disabled={assignment.status === 'delivered'}
                  className={`px-3 py-1 rounded text-white transition ${
                    assignment.status === 'delivered'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

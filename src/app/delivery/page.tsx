"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// 🔹 Types
interface RecentOrder {
  _id: string;
  menuName: string;
  price: number;
  date: string;
  status: string;
}

interface Summary {
  totalOrders: number;
  totalSpent: number;
  favoriteMeal: string;
}

interface DeliveryDashboardData {
  summary: Summary;
  recentOrders: RecentOrder[];
}

export default function DeliveryDashboardPage() {
  const [data, setData] = useState<DeliveryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const res = await fetch("/api/delivery/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to fetch delivery summary");
      }

      const json: DeliveryDashboardData = await res.json();
      setData(json);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <p className="text-center p-6">Loading dashboard...</p>;
  if (!data)
    return <p className="text-center p-6 text-red-500">No data available</p>;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-10">
      <Toaster />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome Delivery Partner</h1>
        <p className="text-gray-500 mt-1">Today is {today}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-3xl font-semibold mt-2 text-gray-800">
            {data.summary.totalOrders}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-3xl font-semibold mt-2 text-green-600">
            ₹{data.summary.totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm">Top Delivered Meal</h3>
          <p className="text-lg font-semibold mt-2 text-gray-800">
            {data.summary.favoriteMeal || "N/A"}
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">🚚 Recent Deliveries</h2>
          <span className="text-sm text-gray-400">
            Last {data.recentOrders.length} deliveries
          </span>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">
            No deliveries completed yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <th className="px-4 py-3">Meal</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Amount</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {order.menuName}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      ₹{order.price}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "assigned"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-right">
                      {new Date(order.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

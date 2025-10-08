"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// 🔹 TypeScript interfaces
interface RecentDelivery {
  id: string;
  menuName: string;
  price: number;
  date: string;
  status: string;
}

interface DeliverySummary {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  cancelledDeliveries: number;
  totalEarnings: number;
  recentDeliveries: RecentDelivery[];
}

export default function DeliveryDashboardPage() {
  const [data, setData] = useState<DeliverySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Strongly typed error handler
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
        const errorResponse: { error?: string } = await res.json();
        throw new Error(errorResponse.error || "Failed to fetch summary");
      }

      const json: DeliverySummary = await res.json();
      setData(json);
    } catch (err) {
      // ✅ Type-safe error handling (no `any`)
      if (err instanceof Error) {
        console.error("Fetch error:", err.message);
        toast.error(err.message);
      } else {
        console.error("Unknown error:", err);
        toast.error("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (!data)
    return <p className="text-center mt-10 text-red-500">No data found</p>;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <Toaster />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          🚴 Delivery Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Today is {today}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Deliveries", value: data.totalDeliveries },
          { title: "Completed", value: data.completedDeliveries },
          { title: "Pending", value: data.pendingDeliveries },
          { title: "Cancelled", value: data.cancelledDeliveries },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white p-5 rounded-xl shadow border border-gray-100 text-center"
          >
            <h3 className="text-gray-500 text-sm">{card.title}</h3>
            <p className="text-3xl font-semibold mt-2 text-gray-800">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Earnings Card */}
      <div className="bg-white p-6 rounded-xl shadow text-center border border-gray-100">
        <h3 className="text-gray-500 text-sm">Total Earnings</h3>
        {/* <p className="text-4xl font-semibold mt-2 text-green-600">
          ₹{data.totalEarnings.toLocaleString()}
        </p> */}
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Deliveries
        </h2>
        {data?.recentDeliveries?.length === 0 ? (
          <p className="text-gray-500">No recent deliveries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-100 rounded-lg">
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="py-2 px-4 text-left">Menu</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentDeliveries?.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t hover:bg-gray-50 transition text-sm"
                  >
                    <td className="py-2 px-4">{d.menuName}</td>
                    <td className="py-2 px-4">₹{d.price}</td>
                    <td
                      className={`py-2 px-4 font-medium ${
                        d.status === "delivered"
                          ? "text-green-600"
                          : d.status === "cancelled"
                          ? "text-red-500"
                          : "text-yellow-600"
                      }`}
                    >
                      {d.status}
                    </td>
                    {/* <td className="py-2 px-4">
                    {new Date(d.date).toLocaleDateString("en-IN")}
                    </td> */}
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

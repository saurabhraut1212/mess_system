"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface RecentItem {
  name: string;
  type: string;
  date: string;
}

interface DashboardSummary {
  totalMenus: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentItems: RecentItem[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to load dashboard");
      } else {
        setData(json as DashboardSummary);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-6 text-center">No data to show</div>;

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
        <h1 className="text-3xl font-bold text-gray-800">Welcome, Admin</h1>
        <p className="text-gray-500 mt-1">Today is {today}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Menus", value: data.totalMenus },
          { label: "Total Orders", value: data.totalOrders },
          { label: "Total Users", value: data.totalUsers },
          {
            label: "Total Revenue",
            value: `₹${data.totalRevenue.toLocaleString()}`,
            color: "text-green-600",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl shadow border border-gray-100 hover:shadow-lg transition-transform transform hover:-translate-y-1"
          >
            <h3 className="text-gray-500 text-sm font-medium">{item.label}</h3>
            <p
              className={`text-3xl font-semibold mt-2 ${
                item.color || "text-gray-800"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
            Recent Activity
          </h2>
          <span className="text-sm text-gray-400">
            Last {data.recentItems.length} records
          </span>
        </div>

        {data.recentItems.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">
            No recent activity found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === "Order"
                            ? "bg-blue-100 text-blue-700"
                            : item.type === "Menu"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-right">
                      {item.date}
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

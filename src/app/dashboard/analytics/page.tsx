'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import OrdersStatusChart from '@/components/charts/OrderStatusChart';
import TopMealsChart from '@/components/charts/TopMealsChart';

// ✅ Define proper TypeScript interfaces
interface OrderStatusData {
  _id: string;
  count: number;
}

interface TopMealData {
  name: string;
  avgRating: number;
  totalReviews: number;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  orderStatusCounts: OrderStatusData[];
  topMealsWithNames: TopMealData[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null); // ✅ Explicit type

  const fetchAnalytics = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/analytics/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result: AnalyticsData | { error: string } = await res.json();

    if (res.ok && 'totalOrders' in result) {
      setData(result);
    } else {
      toast.error((result as { error: string }).error || 'Failed to load analytics');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!data) return <p className="text-center mt-10">Loading analytics...</p>;

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold text-blue-600">{data.totalOrders}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-2xl font-bold text-green-600">₹{data.totalRevenue}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Top Meals</h2>
          <p className="text-2xl font-bold text-yellow-600">{data.topMealsWithNames.length}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersStatusChart data={data.orderStatusCounts} />
        <TopMealsChart data={data.topMealsWithNames} />
      </div>
    </div>
  );
}

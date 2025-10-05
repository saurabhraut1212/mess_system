'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// ✅ Define the structure of the data
interface OrderStatus {
  _id: string; // e.g., 'pending', 'delivered', 'cancelled'
  count: number;
}

// ✅ Define props explicitly
interface OrdersStatusChartProps {
  data: OrderStatus[];
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export default function OrdersStatusChart({ data }: OrdersStatusChartProps) {
  // Format for recharts: { name: string, value: number }
  const formatted = data.map((d) => ({
    name: d._id,
    value: d.count,
  }));

  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Orders by Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={formatted}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {formatted.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

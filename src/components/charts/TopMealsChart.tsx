'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ✅ Define the structure of data
interface TopMeal {
  name: string;        // Meal name
  avgRating: number;   // Average rating (0–5)
  totalReviews: number;
}

// ✅ Define props explicitly
interface TopMealsChartProps {
  data: TopMeal[];
}

export default function TopMealsChart({ data }: TopMealsChartProps) {
  // ✅ Format for Recharts: { name: string, rating: number }
  const formatted = data.map((item) => ({
    name: item.name,
    rating: parseFloat(item.avgRating.toFixed(1)),
  }));

  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Top Rated Meals</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted}>
          <XAxis dataKey="name" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Bar dataKey="rating" fill="#34d399" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

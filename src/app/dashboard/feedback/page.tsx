'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Feedback {
  _id: string;
  rating: number;
  comment?: string;
  user?: { name: string; email: string };
  menu?: { name: string };
  createdAt: string;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/feedback/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to load feedback');
        return;
      }

      const data = await res.json();
      setFeedbacks(data);
    } catch {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  if (loading) return <p className="text-center p-6">Loading feedback...</p>;

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">User Feedback & Ratings</h1>

      {feedbacks.length === 0 ? (
        <p className="text-gray-500">No feedback yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((f) => (
            <div key={f._id} className="border p-4 rounded shadow-sm bg-white">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">{f.menu?.name || 'Deleted Meal'}</p>
                <span className="text-yellow-600 font-bold">
                  ⭐ {f.rating.toFixed(1)}
                </span>
              </div>

              {f.comment && (
                <p className="mt-2 text-gray-700 italic">
                  “{f.comment}”
                </p>
              )}

              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <strong>User:</strong> {f.user?.name} ({f.user?.email})
                </p>
                <p>
                  <strong>Date:</strong> {new Date(f.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

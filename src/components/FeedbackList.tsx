'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// ✅ Define feedback type
interface Feedback {
  _id: string;
  menu?: {
    name: string;
  };
  user?: {
    name: string;
    email: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function FeedbackList() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch feedback from API
  const fetchFeedback = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Unauthorized: Please log in first.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/feedback/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: Feedback[] | { error: string } = await res.json();

      if (res.ok && Array.isArray(data)) {
        setFeedback(data);
      } else {
        toast.error((data as { error: string }).error || 'Failed to fetch feedback');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">User Feedback</h2>

      {/* Loader */}
      {loading && <p className="text-center text-gray-500">Loading feedback...</p>}

      {/* No Feedback State */}
      {!loading && feedback.length === 0 && (
        <p className="text-center text-gray-500">No feedback available yet.</p>
      )}

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.map((f) => (
          <div
            key={f._id}
            className="border p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <p className="text-lg font-semibold">
              🍽 <strong>Meal:</strong> {f.menu?.name || 'Unknown Meal'}
            </p>
            <p>
              ⭐ <strong>Rating:</strong> {f.rating}/5
            </p>
            <p>
              💬 <strong>Comment:</strong> {f.comment || 'No comment provided'}
            </p>
            <p>
              👤 <strong>User:</strong> {f.user?.name || 'Anonymous'} (
              {f.user?.email || 'N/A'})
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(f.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

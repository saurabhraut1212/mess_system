'use client';

import { INotification } from '@/models/Notification';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/notifications/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data: INotification[] = await res.json();
    setNotifications(data);
  };

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/notifications/mark-read', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notificationId: id }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchNotifications();
    }
  };

  // ✅ Clear all notifications
  const clearAllNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('/api/notifications/clear', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setNotifications([]); // Clear from UI
      } else {
        toast.error(data.error || 'Failed to clear notifications');
      }
    } catch (err) {
      console.log(err)
      toast.error('Server error while clearing notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            disabled={loading}
            className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Clearing...' : 'Clear All'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`border p-4 rounded shadow-sm ${
                n.isRead ? 'bg-gray-100' : 'bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{n.title}</h3>
                  <p>{n.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

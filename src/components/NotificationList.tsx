'use client';

import { INotification } from '@/models/Notification';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';


interface NotificationListProps {
  limit?: number;              // optional: show only recent few
  compact?: boolean;           // for small dropdown version
  refreshInterval?: number;    // polling interval (ms)
}

export default function NotificationList({
  limit,
  compact = false,
  refreshInterval = 15000,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/notifications/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data: INotification[] = await res.json();
    setNotifications(limit ? data.slice(0, limit) : data);
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
      toast.success('Marked as read');
      fetchNotifications();
    } else {
      toast.error(data.error || 'Failed to update');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, refreshInterval);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${compact ? 'w-80' : 'w-full p-4'} bg-white rounded shadow`}>
      <Toaster position="top-right" />
      {!compact && <h2 className="text-2xl font-bold mb-4">Notifications</h2>}

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">No notifications yet</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`border p-3 rounded ${n.isRead ? 'bg-gray-100' : 'bg-blue-50'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{n.title}</h3>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

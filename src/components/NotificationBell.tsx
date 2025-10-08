'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { INotification } from '@/models/Notification';


export default function NotificationBell() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const router = useRouter();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/notifications/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const data: INotification[] = await res.json();
    setNotifications(data);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => router.push('/notifications')}
    >
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import OrderForm from '@/components/OrderForm';
import toast, { Toaster } from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  dietaryInfo?: string;
  avgRating: number;
  totalReviews: number;
  date: string;
}

export default function OrdersPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu/list');
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data: MenuItem[] = await res.json();
      console.log('Fetched menu items:', data);
      setMenuItems(data);
    } catch {
      toast.error('Error fetching menu items');
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* ✅ Reuse existing OrderForm logic */}
      <OrderForm
        menuItems={menuItems}
        onSuccess={() => toast.success('Order placed successfully!')}
      />
    </div>
  );
}

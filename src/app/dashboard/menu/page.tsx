'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MenuForm from '@/components/MenuForm';
import toast, { Toaster } from 'react-hot-toast';

interface MenuItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  dietaryInfo?: string;
  date: string;
  isMeal: boolean;
  items?: { name: string; quantity?: string }[];
}

export default function MenuPage() {
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 🧠 Load menu from sessionStorage (passed from menulist)
    const savedMenu = sessionStorage.getItem('editMenu');
    if (savedMenu) {
      setEditItem(JSON.parse(savedMenu));
      sessionStorage.removeItem('editMenu'); // cleanup
    }
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div id="menu-form">
        <MenuForm
          initialValues={editItem || undefined}
          onSuccess={() => {
            toast.success('Menu saved successfully!');
            router.push('/dashboard/menulist');
          }}
        />
      </div>
    </div>
  );
}

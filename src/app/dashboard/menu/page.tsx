'use client';

import { useEffect, useState } from 'react';
import MenuForm from '@/components/MenuForm';
import toast, { Toaster } from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  dietaryInfo?: string;
  date: string;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  const fetchMenus = async () => {
    const res = await fetch('/api/menu/list');
    const data = await res.json();
    setMenus(data);
  };

  useEffect(() => { fetchMenus(); }, []);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/menu/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchMenus();
    } else {
      toast.error(data.error || 'Delete failed');
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <MenuForm
        initialValues={editItem || undefined}
        onSuccess={() => { setEditItem(null); fetchMenus(); }}
      />

      <h2 className="text-xl font-bold mt-8 mb-4">Menu Items</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menus.map(item => (
          <div key={item._id} className="border p-4 rounded shadow">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p>{item.description}</p>
            <p>Price: ₹{item.price}</p>
            <p>Category: {item.category}</p>
            <p>Dietary Info: {item.dietaryInfo}</p>
            <p>Date: {new Date(item.date).toLocaleDateString()}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setEditItem(item)}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

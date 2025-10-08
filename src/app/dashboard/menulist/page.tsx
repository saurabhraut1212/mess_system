'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  dietaryInfo?: string;
  date: string;
  isMeal: boolean;
  items?: { name: string; quantity?: string }[];
}

export default function MenuListPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const router = useRouter();

  const fetchMenus = async () => {
    const res = await fetch('/api/menu/list');
    const data = await res.json();
    setMenus(data);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleEdit = (item: MenuItem) => {
    sessionStorage.setItem('editMenu', JSON.stringify(item)); // pass data directly
    toast('Editing existing menu...', { icon: '✏️' });
    router.push('/dashboard/menu'); // redirect to form
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/menu/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  // ✅ Grouping menus by date
  const getFilteredMenus = (targetDate: Date) => {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    return menus.filter((menu) => {
      const menuDate = new Date(menu.date);
      return menuDate >= startOfDay && menuDate <= endOfDay;
    });
  };

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const yesterdayMenus = getFilteredMenus(yesterday);
  const todayMenus = getFilteredMenus(today);
  const tomorrowMenus = getFilteredMenus(tomorrow);

  const renderSection = (title: string, list: MenuItem[]) => (
    <section className="mb-10">
      <h3 className="text-2xl font-bold mb-5 text-gray-800 border-b-2 border-gray-200 pb-2">
        {title} ({list.length})
      </h3>

      {list.length === 0 ? (
        <p className="text-gray-500 italic">No menus available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <h4 className="text-xl font-semibold text-gray-800">
                {item.name}{' '}
                {item.isMeal && (
                  <span className="text-blue-500 text-sm font-medium">
                    (Meal)
                  </span>
                )}
              </h4>

              {item.description && (
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
              )}

              <div className="mt-3 text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Price:</strong> ₹{item.price}
                </p>
                {item.category && (
                  <p>
                    <strong>Category:</strong> {item.category}
                  </p>
                )}
                {item.dietaryInfo && (
                  <p>
                    <strong>Dietary Info:</strong> {item.dietaryInfo}
                  </p>
                )}
                <p>
                  <strong>Date:</strong> {formatDate(new Date(item.date))}
                </p>
              </div>

              {item.isMeal && item.items?.length ? (
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    Included Dishes:
                  </h5>
                  <ul className="list-disc ml-6 space-y-1 text-gray-700 text-sm">
                    {item.items.map((dish, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{dish.name}</span>
                        {dish.quantity && (
                          <span className="text-gray-500">
                            ({dish.quantity})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mt-10 mb-6 text-gray-800 text-center">
        Manage Menus / Meals
      </h2>
      {renderSection('Yesterday’s Menu', yesterdayMenus)}
      {renderSection('Today’s Menu', todayMenus)}
      {renderSection('Tomorrow’s Menu', tomorrowMenus)}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); // store role after login
    if (token && userRole) setRole(userRole);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Tiffin Mess Management</h1>

      {!role ? (
        <div className="flex gap-4">
          <Link href="/auth/signup" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Signup
          </Link>
          <Link href="/auth/signin" className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
            Signin
          </Link>
        </div>
      ) : role === 'user' ? (
        <Link href="/orders" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          Go to Your Orders
        </Link>
      ) : (
        <Link href="/dashboard/menu" className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Go to Admin Dashboard
        </Link>
      )}
    </div>
  );
}

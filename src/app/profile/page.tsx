'use client';

import { useEffect, useState } from 'react';
import ProfileForm from '@/components/ProfileForm';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  name?: string;
  address?: string;
  contactNumber?: string;
  preferences?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUser(data);
      else toast.error(data.error || 'Failed to fetch profile');
    };
    fetchProfile();
  }, []);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div>
      <Toaster position="top-right" />
      <ProfileForm initialValues={user} />
    </div>
  );
}

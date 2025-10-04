'use client';

import PaymentForm from '@/components/PaymentForm';
import { useSearchParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const router = useRouter();

  if (!orderId) {
    toast.error('Order ID missing');
    return <p className="text-center mt-10">Invalid order</p>;
  }

  return (
    <div>
      <Toaster position="top-right" />
      <PaymentForm orderId={orderId} onSuccess={() => router.push('/orders')} />
    </div>
  );
}

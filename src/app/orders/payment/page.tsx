import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page


// 'use client';

// import PaymentForm from '@/components/PaymentForm';
// import { useSearchParams, useRouter } from 'next/navigation';
// import toast, { Toaster } from 'react-hot-toast';
// import { useEffect, useState } from 'react';

// export default function PaymentPage() {
//   const searchParams = useSearchParams();
//   const orderIdParam = searchParams.get('orderId');
//   const [orderId, setOrderId] = useState('');
//   const router = useRouter();

//   useEffect(() => {
//     if (!orderIdParam) {
//       toast.error('Order ID missing');
//     } else {
//       setOrderId(orderIdParam);
//     }
//   }, [orderIdParam]);

//   if (!orderId) {
//     return <p className="text-center mt-10">Invalid order</p>;
//   }

//   return (
//     <div>
//       <Toaster position="top-right" />
//       <PaymentForm orderId={orderId} onSuccess={() => router.push('/orders')} />
//     </div>
//   );
// }

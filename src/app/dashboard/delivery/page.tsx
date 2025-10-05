'use client';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface DeliveryBoy {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
}

interface ApiError {
  error: string;
}

type DeliveryBoyResponse = DeliveryBoy[] | ApiError;

export default function AssignDeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/orders/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: Order[] = await res.json();
   
   setOrders(
    data
//   data.filter(
//     (o) =>
//       o.status === 'pending' ||
//       o.status === 'preparing' ||
//       o.status === 'out-for-delivery'
//   )
);
  };

const fetchDeliveryBoys = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Unauthorized access');
    return;
  }

  try {
    const res = await fetch('/api/users/list', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data: DeliveryBoyResponse = await res.json();

    // ✅ Type-safe check
    if (Array.isArray(data)) {
      setDeliveryBoys(data);
    } else {
      toast.error(data.error || 'Failed to fetch delivery boys');
      setDeliveryBoys([]); // avoid crash
    }
  } catch (err) {
    console.error('Error fetching delivery boys:', err);
    toast.error('Network error while fetching delivery boys');
    setDeliveryBoys([]);
  }
};

console.log(orders,'orders');
  const assignOrder = async (orderId: string, deliveryBoyId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/delivery/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, deliveryBoyId }),
    });
    const data = await res.json();
    if (res.ok) toast.success('Order assigned');
    else toast.error(data.error);
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys();
  }, []);

  console.log(deliveryBoys,'deliveryBoys');

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4">Assign Orders to Delivery Boys</h1>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order._id} className="border p-4 rounded shadow">
            <h3 className="font-semibold">Order #{order._id.slice(-6)}</h3>
            <p>Total: ₹{order.totalPrice}</p>
            <select
              className="border rounded p-2 mt-2"
              onChange={(e) => assignOrder(order._id, e.target.value)}
              defaultValue=""
            >
              <option value="">Assign Delivery Boy</option>
              {deliveryBoys.map((boy) => (
                <option key={boy._id} value={boy._id}>
                  {boy.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { Formik, Form, Field, FieldArray, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface OrderItem {
  menuId: string;
  quantity: number;
  instructions?: string;
  addons?: string[];
}

interface OrderFormProps {
  menuItems: MenuItem[];
  onSuccess?: () => void;
}

interface OrderFormValues {
  items: OrderItem[];
}

const OrderSchema = Yup.object().shape({
  items: Yup.array()
    .of(
      Yup.object().shape({
        menuId: Yup.string().required(),
        quantity: Yup.number().min(1, 'Minimum 1').required('Quantity required'),
        instructions: Yup.string(),
        addons: Yup.array().of(Yup.string()),
      })
    )
    .min(1, 'Select at least one item'),
});

export default function OrderForm({ menuItems, onSuccess }: OrderFormProps) {
  const handleSubmit = async (values: OrderFormValues, { setSubmitting }: FormikHelpers<OrderFormValues>) => {
    try {
      const token = localStorage.getItem('token');
      const totalPrice = values.items.reduce((sum, item) => {
        const menu = menuItems.find(m => m._id === item.menuId);
        return sum + (menu?.price || 0) * item.quantity;
      }, 0);

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...values, totalPrice }),
      });

      const data: { message?: string; error?: string } = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Order placed!');
        onSuccess?.();
      } else {
        toast.error(data.error || 'Order failed');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">Place Order</h2>
      <Formik<OrderFormValues>
        initialValues={{
          items: menuItems.map(item => ({ menuId: item._id, quantity: 1, instructions: '', addons: [] })),
        }}
        validationSchema={OrderSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-4">
            <FieldArray name="items">
              {() =>
                values.items.map((item, index) => {
                  const menu = menuItems.find(m => m._id === item.menuId);
                  return (
                    <div key={item.menuId} className="border p-4 rounded space-y-2">
                      <h3 className="font-bold">{menu?.name}</h3>
                      <p>Price: ₹{menu?.price}</p>
                      <div className="flex gap-2 items-center">
                        <label>Quantity:</label>
                        <Field type="number" name={`items.${index}.quantity`} className="w-16 p-1 border rounded" />
                        <ErrorMessage name={`items.${index}.quantity`} component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <Field
                          placeholder="Instructions"
                          name={`items.${index}.instructions`}
                          className="w-full p-2 border rounded"
                        />
                        <ErrorMessage name={`items.${index}.instructions`} component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                  );
                })
              }
            </FieldArray>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {isSubmitting ? 'Placing...' : 'Place Order'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

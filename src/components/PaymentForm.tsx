'use client';

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';

interface PaymentFormProps {
  orderId: string;
  onSuccess?: () => void;
}

interface PaymentValues {
  paymentMethod: 'UPI' | 'Card' | 'Wallet' | '';
}

const PaymentSchema = Yup.object().shape({
  paymentMethod: Yup.string().oneOf(['UPI', 'Card', 'Wallet'], 'Select a valid payment method').required('Select a payment method'),
});

export default function PaymentForm({ orderId, onSuccess }: PaymentFormProps) {
  const handleSubmit = async (
    values: PaymentValues,
    { setSubmitting }: FormikHelpers<PaymentValues>
  ) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, ...values }),
      });
      const data: { message?: string; error?: string } = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Payment successful!');
        onSuccess?.();
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">Make Payment</h2>
      <Formik
        initialValues={{ paymentMethod: '' }}
        validationSchema={PaymentSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Payment Method</label>
              <Field as="select" name="paymentMethod" className="w-full p-2 border rounded">
                <option value="">Select</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Wallet">Wallet</option>
              </Field>
              <ErrorMessage
                name="paymentMethod"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              {isSubmitting ? 'Processing...' : 'Pay Now'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

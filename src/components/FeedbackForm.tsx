'use client';

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';

// ✅ Define validation schema
const FeedbackSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5')
    .required('Rating is required'),
  comment: Yup.string().max(300, 'Maximum 300 characters allowed'),
});

// ✅ Define form value types
interface FeedbackValues {
  rating: number;
  comment: string;
}

// ✅ Define component props
interface FeedbackFormProps {
  menuId: string;
  orderId: string;
  onSuccess?: () => void;
}

export default function FeedbackForm({ menuId, orderId, onSuccess }: FeedbackFormProps) {
  // ✅ Typed submit handler
  const handleSubmit = async (
    values: FeedbackValues,
    { setSubmitting, resetForm }: FormikHelpers<FeedbackValues>
  ): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to submit feedback');
        return;
      }

      const res = await fetch('/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menu: menuId, order: orderId, ...values }),
      });

      const data: { message?: string; error?: string } = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Feedback submitted successfully');
        resetForm();
        onSuccess?.();
      } else {
        toast.error(data.error || 'Failed to submit feedback');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md p-6 bg-white shadow rounded mt-6">
      <Toaster position="top-right" />
      <h3 className="text-xl font-semibold mb-4 text-center">Rate Your Meal</h3>

      <Formik<FeedbackValues>
        initialValues={{ rating: 5, comment: '' }}
        validationSchema={FeedbackSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {/* Rating Field */}
            <div>
              <label className="block mb-1 font-medium">Rating (1–5)</label>
              <Field
                name="rating"
                type="number"
                min="1"
                max="5"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage name="rating" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Comment Field */}
            <div>
              <label className="block mb-1 font-medium">Comment</label>
              <Field
                as="textarea"
                name="comment"
                rows={3}
                placeholder="Your feedback..."
                className="w-full p-2 border rounded resize-none"
              />
              <ErrorMessage name="comment" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

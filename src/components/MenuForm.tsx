'use client';

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';

const MenuSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  description: Yup.string(),
  category: Yup.string(),
  dietaryInfo: Yup.string(),
  date: Yup.date().required('Date is required'),
});

interface MenuValues {
  id?: string ;
  name: string;
  price: number;
  description?: string;
  category?: string;
  dietaryInfo?: string;
  date: string;
}

interface MenuFormProps {
  initialValues?: Partial<MenuValues>;
  onSuccess?: () => void;
}

export default function MenuForm({ initialValues, onSuccess }: MenuFormProps) {
  const handleSubmit = async (
    values: MenuValues,
    { setSubmitting }: FormikHelpers<MenuValues>
  ) => {
    try {
      const token = localStorage.getItem('token');
      const method = values.id ? 'PATCH' : 'POST';
      const endpoint = values.id ? '/api/menu/update' : '/api/menu/create';

      const { id, ...rest } = values;
      const body = values.id ? { id, ...rest } : rest;


      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data: { message?: string; error?: string } = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Success!');
        onSuccess?.();
      } else {
        toast.error(data.error || 'Operation failed');
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
      <h2 className="text-2xl font-bold mb-6 text-center">
        {initialValues?.id ? 'Edit Menu' : 'Add Menu'}
      </h2>
      <Formik<MenuValues>
        initialValues={{
          id: initialValues?.id ?? undefined,
          name: initialValues?.name || '',
          description: initialValues?.description || '',
          price: initialValues?.price ?? 0,
          category: initialValues?.category || '',
          dietaryInfo: initialValues?.dietaryInfo || '',
          date: initialValues?.date
            ? new Date(initialValues.date).toISOString().slice(0, 10)
            : '',
        }}
        validationSchema={MenuSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <Field name="name" placeholder="Name" className="w-full p-2 border rounded" />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <Field
                name="description"
                placeholder="Description"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                name="price"
                type="number"
                placeholder="Price"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <Field
                name="category"
                placeholder="Category"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="category"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                name="dietaryInfo"
                placeholder="Dietary Info"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="dietaryInfo"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field name="date" type="date" className="w-full p-2 border rounded" />
              <ErrorMessage name="date" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {isSubmitting ? 'Saving...' : initialValues?.id ? 'Update Menu' : 'Add Menu'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

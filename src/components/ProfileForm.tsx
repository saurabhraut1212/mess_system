'use client';

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ProfileSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').required('Name is required'),
  address: Yup.string().min(5, 'Too Short!').required('Address is required'),
  contactNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be 10 digits')
    .required('Contact number is required'),
  preferences: Yup.string(),
});

interface ProfileValues {
  name: string;
  address: string;
  contactNumber: string;
  preferences: string;
}

interface ProfileFormProps {
  initialValues?: Partial<ProfileValues>;
}

export default function ProfileForm({ initialValues }: ProfileFormProps) {
    const router = useRouter();
  const handleSubmit = async (
    values: ProfileValues,
    { setSubmitting }: FormikHelpers<ProfileValues>
  ) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data: { message?: string; error?: string } = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Profile updated!');
        router.push('/orders')

      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Server error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>
      <Formik
        initialValues={{
          name: initialValues?.name || '',
          address: initialValues?.address || '',
          contactNumber: initialValues?.contactNumber || '',
          preferences: initialValues?.preferences || '',
        }}
        validationSchema={ProfileSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <Field name="name" placeholder="Name" className="w-full p-2 border rounded" />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <Field name="address" placeholder="Address" className="w-full p-2 border rounded" />
              <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <Field
                name="contactNumber"
                placeholder="Contact Number"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="contactNumber"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                name="preferences"
                placeholder="Preferences (optional)"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="preferences"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

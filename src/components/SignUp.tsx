'use client';

import { Formik, Form, Field, ErrorMessage,FormikHelpers } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 

interface SignupValues {
  name: string;
  email: string;
  password: string;
}

const SignupSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password too short').required('Password is required'),
});

export default function SignupForm() {
  const router = useRouter();

 const handleSubmit = async (
  values: SignupValues,
  formikHelpers: FormikHelpers<SignupValues>
) => {
  const { setSubmitting, resetForm } = formikHelpers;
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data: { message?: string; error?: string } = await res.json();

    if (res.ok) {
      toast.success(data.message || 'Signup successful!');
      resetForm();
      router.push('/auth/signin');
    } else {
      toast.error(data.error || 'Something went wrong');
    }
  } catch (err: unknown) {
    console.error(err);
    toast.error('Server error');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
      <Formik
        initialValues={{ name: '', email: '', password: '' }}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <Field
                name="name"
                placeholder="Name"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <Field
                name="email"
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <Field
                name="password"
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {isSubmitting ? 'Signing up...' : 'Signup'}
            </button>
          </Form>
        )}
      </Formik>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already registered?{' '}
        <Link href="/auth/signin" className="text-blue-500 hover:underline">
          Go to login
        </Link>
      </p>
    </div>
  );
}

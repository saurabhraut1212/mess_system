"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SignupValues {
  name: string;
  email: string;
  password: string;
}

const SignupSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password too short")
    .required("Password is required"),
});

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: SignupValues,
    formikHelpers: FormikHelpers<SignupValues>
  ) => {
    const { setSubmitting, resetForm } = formikHelpers;
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data: { message?: string; error?: string } = await res.json();

      if (res.ok) {
        toast.success(data.message || "Signup successful!");
        resetForm();
        router.push("/signin");
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className=" flex items-center justify-center bg-gray-50">
      <Toaster position="top-right" />
      <div className="w-full max-w-2xl bg-white p-8 sm:p-10 md:p-12 rounded-2xl shadow-xl border border-gray-100 mx-auto">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800 whitespace-nowrap">
          Create Your Account
        </h2>
        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Field
                  name="name"
                  placeholder="Enter your name"
                  className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-400 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {isSubmitting ? "Signing up..." : "Signup"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 ">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

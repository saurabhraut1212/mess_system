"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";

export default function ContactPage() {
  const ContactSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    message: Yup.string().min(10, "Message too short").required("Message is required"),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-br from-[#eaf1f8] via-[#f6f8fb] to-[#eef1f6] text-gray-800">
      <Toaster />
      <div className="max-w-xl w-full bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-md border border-gray-100">
        <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800 whitespace-nowrap">Contact Us</h1>
        <Formik
          initialValues={{ name: "", email: "", message: "" }}
          validationSchema={ContactSchema}
          onSubmit={(values, { resetForm }) => {
            console.log(values);
            toast.success("Message sent successfully!");
            resetForm();
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Field
                  name="name"
                  placeholder="Your Name"
                  className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-[#4A6FA5] outline-none"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-[#4A6FA5] outline-none"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <Field
                  as="textarea"
                  name="message"
                  placeholder="Your Message"
                  rows={4}
                  className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-[#4A6FA5] outline-none"
                />
                <ErrorMessage name="message" component="div" className="text-red-500 text-sm" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4A6FA5] text-white py-2 rounded-lg hover:bg-[#3b5b86] transition"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

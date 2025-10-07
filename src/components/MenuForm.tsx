"use client";

import {
  Formik,
  Form,
  Field,
  FieldArray,
  ErrorMessage,
  FormikHelpers,
} from "formik";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

const MenuSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  price: Yup.number().required("Price is required").min(0, "Price must be positive"),
  description: Yup.string(),
  category: Yup.string(),
  dietaryInfo: Yup.string(),
  date: Yup.date().required("Date is required"),
  isMeal: Yup.boolean(),
  items: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Dish name is required"),
      quantity: Yup.string().nullable(),
    })
  ),
});

interface MenuValues {
  _id?:string;
  id?: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  dietaryInfo?: string;
  date: string;
  isMeal: boolean;
  items: { name: string; quantity?: string }[];
}

interface MenuFormProps {
  initialValues?: Partial<MenuValues>;
  onSuccess?: () => void;
}

export default function MenuForm({ initialValues, onSuccess }: MenuFormProps) {
  const [isMeal, setIsMeal] = useState(initialValues?.isMeal || false);

  // ✅ Sync meal type when editing a menu
  useEffect(() => {
    setIsMeal(initialValues?.isMeal || false);
  }, [initialValues]);

  const handleSubmit = async (
    values: MenuValues,
    { setSubmitting, resetForm }: FormikHelpers<MenuValues>
  ) => {
    try {
      const token = localStorage.getItem("token");
      const isUpdate = !!values.id;
      const method = isUpdate ? "PATCH" : "POST";
      const endpoint = isUpdate ? "/api/menu/update" : "/api/menu/create";

      // ✅ Clean up empty dishes
      const cleanItems =
        values.isMeal && Array.isArray(values.items)
          ? values.items.filter((item) => item.name.trim() !== "")
          : [];

      const payload = {
        ...values,
        items: cleanItems,
        id: values.id, // Ensure correct id is sent for PATCH
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || (isUpdate ? "Updated!" : "Created!"));
        onSuccess?.();
        resetForm();
        setIsMeal(false);
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <Toaster position="top-right" />

      <h2 className="text-2xl font-bold mb-4 text-center">
        {initialValues?._id || initialValues?.id ? "Edit Menu / Meal" : "Add Menu / Meal"}
      </h2>

      {/* Optional indicator when editing */}
      {initialValues?.name && (
        <p className="text-center text-gray-600 mb-3 italic">
          ✏️ Editing: <span className="font-semibold">{initialValues.name}</span>
        </p>
      )}

      <Formik<MenuValues>
        enableReinitialize={true}
        initialValues={{
          id: initialValues?._id || initialValues?.id || undefined, // ✅ Fix for _id
          name: initialValues?.name || "",
          description: initialValues?.description || "",
          price: initialValues?.price ?? 0,
          category: initialValues?.category || "",
          dietaryInfo: initialValues?.dietaryInfo || "",
          date: initialValues?.date
            ? new Date(initialValues.date).toISOString().slice(0, 10)
            : "",
          isMeal: initialValues?.isMeal || false,
          items: initialValues?.items || [],
        }}
        validationSchema={MenuSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue,resetForm  }) => (
          <Form className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="font-semibold">Is this a full meal?</label>
              <input
                type="checkbox"
                checked={values.isMeal}
                onChange={(e) => {
                  setFieldValue("isMeal", e.target.checked);
                  setIsMeal(e.target.checked);
                  if (e.target.checked && (!values.items || values.items.length === 0)) {
                    setFieldValue("items", [{ name: "", quantity: "" }]);
                  }
                }}
              />
            </div>

            <div>
              <Field
                name="name"
                placeholder="Meal / Item Name"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <Field name="description" placeholder="Description" className="w-full p-2 border rounded" />
            </div>

            {isMeal && (
              <div className="border p-3 rounded-md bg-gray-50">
                <h3 className="font-semibold mb-2">Meal Items</h3>
                <FieldArray name="items">
                  {({ remove, push }) => (
                    <div className="space-y-2">
                      {values.items.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Field
                            name={`items[${index}].name`}
                            placeholder="Dish name"
                            className="flex-1 p-2 border rounded"
                          />
                          <Field
                            name={`items[${index}].quantity`}
                            placeholder="Qty"
                            className="w-1/4 p-2 border rounded"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="bg-red-500 text-white px-2 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push({ name: "", quantity: "" })}
                        className="bg-green-500 text-white px-3 py-1 rounded mt-2"
                      >
                        + Add Dish
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field name="price" type="number" placeholder="Price" className="p-2 border rounded" />
              <Field name="category" placeholder="Category" className="p-2 border rounded" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field name="dietaryInfo" placeholder="Dietary Info" className="p-2 border rounded" />
              <Field name="date" type="date" className="p-2 border rounded" />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                {isSubmitting
                  ? "Saving..."
                  : values.id
                  ? "Update Menu / Meal"
                  : "Save Menu / Meal"}
              </button>

              {/* Optional cancel edit */}
              {values.id && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsMeal(false);
                    onSuccess?.();
                  }}
                  className="w-1/3 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

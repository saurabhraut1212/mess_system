'use client';

import { Formik, Form, Field, FieldArray, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  avgRating: number;
  totalReviews: number;
  isMeal?: boolean;
  items?: { name: string; quantity?: string }[];
}

interface OrderItem {
  menuId: string;
  quantity: number;
  instructions?: string;
}

interface OrderFormProps {
  menuItems: MenuItem[];
  onSuccess?: () => void;
}

interface OrderFormValues {
  items: OrderItem[];
  selectedMenuIds: string[];
}

const OrderSchema = Yup.object().shape({
  selectedMenuIds: Yup.array().of(Yup.string()).min(1, 'Select at least one menu'),
  items: Yup.array().of(
    Yup.object().shape({
      menuId: Yup.string().required(),
      quantity: Yup.number().min(1, 'Minimum 1').required('Quantity required'),
      instructions: Yup.string(),
    })
  ),
});

export default function OrderForm({ menuItems, onSuccess }: OrderFormProps) {
  const router = useRouter();
  const handleSubmit = async (
    values: OrderFormValues,
    { setSubmitting }: FormikHelpers<OrderFormValues>
  ) => {
    try {
      const token = localStorage.getItem('token');

      // ✅ Include only selected menu items
      const selectedItems = values.items.filter((i) =>
        values.selectedMenuIds.includes(i.menuId)
      );

      if (selectedItems.length === 0) {
        toast.error('Please select at least one menu.');
        setSubmitting(false);
        return;
      }

      // ✅ Calculate total
      const totalPrice = selectedItems.reduce((sum, item) => {
        const menu = menuItems.find((m) => m._id === item.menuId);
        return sum + (menu?.price || 0) * item.quantity;
      }, 0);

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: selectedItems, totalPrice }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Order placed successfully!');
        onSuccess?.();
        router.push('/customer/orders');
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

  const initialValues: OrderFormValues = useMemo(
    () => ({
      selectedMenuIds: [],
      items: menuItems.map((item) => ({
        menuId: item._id,
        quantity: 1,
        instructions: '',
      })),
    }),
    [menuItems]
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center">Place Your Order</h2>

      <Formik<OrderFormValues>
        initialValues={initialValues}
        validationSchema={OrderSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting }) => {
          const selectedMenus = menuItems.filter((menu) =>
            values.selectedMenuIds.includes(menu._id)
          );

          const totalPrice = selectedMenus.reduce((sum, menu) => {
            const item = values.items.find((i) => i.menuId === menu._id);
            return sum + (menu.price || 0) * (item?.quantity || 1);
          }, 0);

          return (
            <Form className="space-y-6">
              <FieldArray name="items">
                {() => (
                  <div className="space-y-4">
                    {menuItems.map((menu, index) => {
                      const isSelected = values.selectedMenuIds.includes(menu._id);

                      return (
                        <div
                          key={menu._id}
                          className={`border p-4 rounded transition ${
                            isSelected ? 'bg-blue-50 border-blue-400' : 'border-gray-200'
                          }`}
                        >
                          {/* ✅ Checkbox for selection */}
                          <div className="flex items-center justify-between">
                            <label className="font-semibold text-lg flex items-center gap-2">
                              <Field
                                type="checkbox"
                                name="selectedMenuIds"
                                value={menu._id}
                                className="w-4 h-4"
                              />
                              {menu.name}
                            </label>
                            <span className="text-gray-700 font-medium">
                              ₹{menu.price}
                            </span>
                          </div>

                          {/* Ratings */}
                          <p className="text-sm text-gray-600 mt-1">
                            {menu.avgRating > 0
                              ? `⭐ ${menu.avgRating.toFixed(1)} (${menu.totalReviews} reviews)`
                              : 'No ratings yet'}
                          </p>

                          {/* Show meal items if applicable */}
                        {menu.isMeal && (menu.items?.length ?? 0) > 0 && (
                          <div className="mt-3 pl-4">
                            <p className="font-medium text-gray-800 mb-1"> Meal Includes:</p>
                            <ul className="list-disc ml-6 text-sm text-gray-700">
                              {(menu.items ?? []).map((dish, i) => (
                                <li key={i}>
                                  {dish.name}{' '}
                                  {dish.quantity && (
                                    <span className="text-gray-500">({dish.quantity})</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                          {/* Quantity and instructions only if selected */}
                          {isSelected && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-3">
                                <label>Qty:</label>
                                <Field
                                  type="number"
                                  name={`items.${index}.quantity`}
                                  className="w-20 p-1 border rounded"
                                  min="1"
                                />
                                <ErrorMessage
                                  name={`items.${index}.quantity`}
                                  component="div"
                                  className="text-red-500 text-sm"
                                />
                              </div>

                              <Field
                                name={`items.${index}.instructions`}
                                placeholder="Any special instructions..."
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </FieldArray>

              {/* ✅ Show total price dynamically */}
              {values.selectedMenuIds.length > 0 && (
                <div className="text-right font-semibold text-lg text-gray-800">
                  Total: ₹{totalPrice.toFixed(2)}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                {isSubmitting ? 'Placing...' : 'Place Order'}
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

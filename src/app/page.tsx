"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import FoodCarousel from "@/components/FoodCarousel";

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    if (token && userRole) setRole(userRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#eaf1f8] via-[#f6f8fb] to-[#eef1f6] text-gray-800 overflow-y-auto md:overflow-hidden px-5 sm:px-8 md:px-12 lg:px-20 py-10 md:py-0">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(74,111,165,0.08),_transparent_70%)] pointer-events-none" />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center max-w-[1600px] w-full">
        {/* LEFT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center text-left space-y-6 sm:space-y-8 px-2 md:px-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            <span className="text-[#4A6FA5]">Healthy Meals</span>, Delivered{" "}
            <span className="text-green-600">Daily</span> 🍱
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed">
            Experience home-cooked freshness at your doorstep. Choose your meal,
            track your order, and enjoy nutritious food crafted with care —
            every single day.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            {!role ? (
              <>
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-[#4A6FA5] text-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#3b5b86] transition-all duration-300 text-base sm:text-lg font-medium"
                >
                  Get Started
                </Link>
                <Link
                  href="/signin"
                  className="px-8 py-3 bg-green-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-green-700 transition-all duration-300 text-base sm:text-lg font-medium"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                {role === "admin" && (
                  <Link
                    href="/dashboard/orders"
                    className="px-8 py-3 bg-green-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-green-700 transition-all duration-300 text-base sm:text-lg font-medium"
                  >
                    Go to Admin Dashboard
                  </Link>
                )}
                {role === "customer" && (
                  <Link
                    href="/orders"
                    className="px-8 py-3 bg-[#4A6FA5] text-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#3b5b86] transition-all duration-300 text-base sm:text-lg font-medium"
                  >
                    Go to Menu
                  </Link>
                )}
                {role === "delivery" && (
                  <Link
                    href="/delivery/orders"
                    className="px-8 py-3 bg-yellow-500 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-yellow-600 transition-all duration-300 text-base sm:text-lg font-medium"
                  >
                    Go to Delivery Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-red-600 transition-all duration-300 text-base sm:text-lg font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Tagline */}
          <div className="pt-4 border-l-4 border-[#4A6FA5] pl-4 text-sm sm:text-base text-gray-500 max-w-xl">
            <p>
              🍴{" "}
              <span className="font-semibold text-[#4A6FA5]">5,000+</span> happy
              customers served monthly.
            </p>
            <p>
              🚚 Fast delivery across{" "}
              <span className="font-semibold">Pune</span> & nearby areas.
            </p>
          </div>
        </motion.div>

        {/* RIGHT SECTION (CAROUSEL) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center md:justify-end"
        >
          <div className="max-w-lg sm:max-w-xl w-full">
            <FoodCarousel />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

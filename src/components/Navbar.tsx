"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // ✅ Import global context

export default function Navbar() {
  const { token, role, logout } = useAuth(); // ✅ Get from context
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isHomePage = pathname === "/";

  const handleLogout = () => {
    logout(); // ✅ Clear auth context + localStorage
    router.push("/");
  };

  // ✅ Role-based navigation links
  const navLinks =
    role === "admin"
      ? [
          { name: "Home", path: "/dashboard" },
          { name: "Orders", path: "/dashboard/orders" },
          { name: "Menu", path: "/dashboard/menu" },
          {name:"MenuList",path:"/dashboard/menulist"},
          { name: "Notifications", path: "/notifications" },
          { name: "Analytics", path: "/dashboard/analytics" },
        ]
      : role === "customer"
      ? [
          { name: "Home", path: "/customer" },
          // { name: "Menu", path: "/menu" },
          { name: "My Orders", path: "/customer/orders" },
            { name: "Notifications", path: "/notifications" },
          { name: "Profile", path: "/profile" },
        ]
      : role === "delivery"
      ? [
          { name: "Home", path: "/delivery" },
        { name: "My Deliveries", path: "/delivery/orders" },
        { name: "Notifications", path: "/notifications" },
        { name: "Profile", path: "/profile" },


      ]
      : [
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
          { name: "Contact", path: "/contact" },
        ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md ${
        isHomePage
          ? "bg-white/80 text-[#1f2937] shadow-sm"
          : "bg-[#7A9CC6]/95 text-white shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-4">
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-bold tracking-wide flex items-center gap-2 ${
            isHomePage ? "text-[#4A6FA5]" : "text-white"
          }`}
        >
          <span className="hidden sm:inline">Tiffin Mess</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`font-medium text-sm uppercase tracking-wide transition-all duration-200 ${
                isHomePage
                  ? "hover:text-[#4A6FA5]"
                  : "hover:text-yellow-200"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* ✅ Logout only when logged in (and not on home) */}
          {token && !isHomePage && (
            <button
              onClick={handleLogout}
              className="ml-4 px-5 py-2 rounded-lg font-medium text-sm bg-white text-[#4A6FA5] hover:bg-[#e3ebf6] transition-all duration-300 shadow-sm"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div
          className={`md:hidden flex flex-col items-center gap-4 pb-6 transition-all duration-300 shadow-md ${
            isHomePage
              ? "bg-white/95 text-gray-800"
              : "bg-[#7A9CC6]/95 text-white"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className="font-medium text-sm uppercase tracking-wide"
            >
              {link.name}
            </Link>
          ))}

          {token && !isHomePage && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="mt-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

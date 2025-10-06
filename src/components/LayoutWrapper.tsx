"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes where Footer should be hidden
  const hideFooterRoutes = [
    "/signin",
    "/signup",
    "/dashboard",
    "/orders",
    "/profile",
    "/delivery",
    "/menu",
  ];

  const shouldHideFooter = hideFooterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Define routes where Navbar should be hidden (auth pages)
  const hideNavbarRoutes = ["/signin", "/signup"];
  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Conditional Navbar */}
      {!shouldHideNavbar && <Navbar />}

      {/* Main Content */}
      <main className={`flex-1 ${!shouldHideNavbar ? "pt-16" : ""}`}>
        {children}
      </main>

      {/* ✅ Conditional Footer */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

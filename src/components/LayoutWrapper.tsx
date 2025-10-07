"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ Routes where footer should be hidden
  const hideFooterRoutes = [
    "/signin",
    "/signup",
    "/orders",
    "/profile",
    "/delivery",
    "/menu",
  ];

  // ✅ Hide footer if route starts with these
  const shouldHideFooterBase = hideFooterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ✅ Hide footer on dashboard subroutes like /dashboard/orders, /dashboard/menu, etc.
  const isDashboardSubRoute =
    pathname.startsWith("/dashboard/") && pathname !== "/dashboard";

  // ✅ Final footer visibility condition
  const shouldHideFooter = shouldHideFooterBase || isDashboardSubRoute;

  // ✅ Hide navbar on auth routes
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

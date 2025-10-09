"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Wait until AuthContext has loaded values from localStorage
    if (token === null && role === null) return;

    // ✅ If no token → redirect to login
    if (!token) {
      router.replace("/login");
      return;
    }

    // ✅ Define access rules
    const accessMap: Record<string, RegExp> = {
      admin: /^(\/dashboard|\/customer|\/delivery|\/notifications|\/profile)(\/.*)?$/,
      customer: /^(\/customer|\/notifications|\/profile)(\/.*)?$/,
      delivery: /^(\/delivery|\/notifications|\/profile)(\/.*)?$/,
    };

    // ✅ Redirect map
    const redirectMap: Record<string, string> = {
      admin: "/dashboard",
      customer: "/customer",
      delivery: "/delivery",
    };

    // ✅ If route doesn’t match allowed paths for that role
    if (role && !accessMap[role]?.test(pathname)) {
      router.replace(redirectMap[role]);
      return;
    }

    setAuthChecked(true);
  }, [token, role, pathname, router]);

  // 🕒 Wait until auth check is completed before rendering
  if (!authChecked) return null;

  return <>{children}</>;
}

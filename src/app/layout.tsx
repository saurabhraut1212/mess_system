import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Tiffin Mess",
  description: "Healthy home-cooked meals delivered daily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="flex flex-col min-h-screen 
        bg-gradient-to-br from-[#eaf1f8] via-[#f6f8fb] to-[#eef1f6] 
        text-gray-800 transition-all duration-500"
      >
        <AuthProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

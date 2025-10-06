

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f6f8fb] text-gray-900 min-h-screen flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}

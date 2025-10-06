import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#eaf1f8] via-[#f6f8fb] to-[#eef1f6] px-4">
      <h1 className="text-[6rem] font-extrabold text-[#4A6FA5] drop-shadow-md">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mt-2">Page Not Found</h2>
      <p className="text-gray-500 mt-3 mb-8 max-w-md">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3b5b86] transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}

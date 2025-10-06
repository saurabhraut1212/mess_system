"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#eaf1f8] via-[#f6f8fb] to-[#eef1f6] px-4">
      <h1 className="text-4xl font-bold text-[#4A6FA5] mb-4">Something went wrong 😔</h1>
      <p className="text-gray-600 max-w-md mb-8">
        We encountered an unexpected issue. Please try refreshing or return to the homepage.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-[#4A6FA5] text-white rounded-lg hover:bg-[#3b5b86] transition"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

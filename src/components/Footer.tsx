"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-[#dce5f3] via-[#cfd9eb] to-[#bfcde4] py-10 px-6 md:px-12 shadow-inner mt-auto">

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start text-gray-800">
        {/* Left Section: Brand */}
        <div className="flex flex-col justify-between h-full text-center md:text-left">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2 text-[#4A6FA5]">
              Tiffin Mess
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed max-w-sm mx-auto md:mx-0">
              Fresh, hygienic, and affordable home-cooked meals delivered daily.
              Your taste of home, every single day.
            </p>
          </div>
        </div>

        {/* Middle Section: Quick Links */}
        <div className="flex flex-col justify-between h-full text-center md:text-left">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-[#4A6FA5]">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/about" className="hover:text-[#4A6FA5] transition">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-[#4A6FA5] transition">
                Contact
              </Link>
              <Link href="/menu" className="hover:text-[#4A6FA5] transition">
                Today’s Menu
              </Link>
              <Link href="/privacy" className="hover:text-[#4A6FA5] transition">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section: Social Media */}
        <div className="flex flex-col justify-between h-full text-center md:text-right">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-[#4A6FA5]">
              Follow Us
            </h3>
            <div className="flex justify-center md:justify-end gap-3">
              <Link
                href="#"
                className="p-2 bg-white/50 rounded-full hover:bg-[#4A6FA5] hover:text-white transition"
              >
                <Facebook size={18} />
              </Link>
              <Link
                href="#"
                className="p-2 bg-white/50 rounded-full hover:bg-[#4A6FA5] hover:text-white transition"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="#"
                className="p-2 bg-white/50 rounded-full hover:bg-[#4A6FA5] hover:text-white transition"
              >
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          <p className="text-xs text-gray-700 mt-6">
            © {new Date().getFullYear()} Tiffin Mess — All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#c7d2e2] mt-8 pt-4 text-center text-xs text-gray-600">
        Made with ❤️ in Pune by{" "}
        <span className="font-semibold text-[#4A6FA5]">Saurabh Raut</span>
      </div>
    </footer>
  );
}

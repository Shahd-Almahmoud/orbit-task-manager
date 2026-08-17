"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import Navbar from "@/components/navbar"; 
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const token = Cookies.get("Bearer");
    if (token) {
      setIsLoggedIn(true);
    }
    setIsMounted(true);
  }, []);

  if (!isMounted)
    return (
      <div className="p-4 text-slate-500">Loading Orbit Task Manager...</div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full">
      <Navbar />

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 min-h-[75vh]">
        <div className="max-w-xl w-full text-center bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-100">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-4 tracking-tight">
            Orbit Task Manager
          </h1>
          <p className="text-base text-slate-600 mb-8 leading-relaxed">
            Welcome to Orbit task management system.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-gauge-high"></i> Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

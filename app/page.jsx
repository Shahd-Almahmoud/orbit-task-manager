"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import Navbar from "@/components/navbar"; 

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
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

      <div className="flex min-h-[75vh] flex-1 flex-col items-center justify-center px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="w-full max-w-xl rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-xl sm:p-10 md:p-12">
          <div className="mx-auto mb-6 flex min-h-24 w-full max-w-md items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-600 px-5 py-6 shadow-lg ring-1 ring-slate-800/10 transition-transform duration-300 hover:scale-[1.02] sm:min-h-32 sm:px-10 sm:py-9">
            <img
              src="/Orbit_company-logo-side-white-03.png"
              alt="Orbit Task Manager"
              className="h-auto max-h-20 w-full object-contain sm:max-h-24"
            />
          </div>
          <p className="text-base text-slate-600 mb-8 leading-relaxed">
            Welcome to Orbit task management system.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            {isLoggedIn ? (
              // if logged in, show dashboard link
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                <i className="fa-solid fa-gauge-high"></i> Go to Dashboard
              </Link>
            ) : (
              // if not logged in, show login and register links
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-6 py-3 font-medium text-indigo-600 shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-100"
                >
                   Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

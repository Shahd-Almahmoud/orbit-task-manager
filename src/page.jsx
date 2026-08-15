"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "universal-cookie";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const cookie = new Cookies();
    const token = cookie.get("Bearer");
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 min-h-[75vh]">
      <div className="max-w-xl w-full text-center bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-100">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r flow bg-indigo-600 to-violet-600 mb-4">
          Orbit Task Manager
        </h1>
        <p className="text-base text-slate-600 mb-8 leading-relaxed">
          Welcome to Orbit! A headless task management system with advanced multi-assignee capabilities for developers, managers, and admins.
        </p>

        <div className="flex justify-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition transform hover:-translate-y-0.5">
              <i className="fa-solid fa-gauge-high"></i> Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-2 px-6 py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition transform hover:-translate-y-0.5">
                <i className="fa-solid fa-right-to-bracket"></i> Log In
              </Link>
              <Link href="/register" className="flex items-center gap-2 px-6 py-3 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                <i className="fa-solid fa-user-plus"></i> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

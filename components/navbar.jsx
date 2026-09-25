"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("developer");
  useEffect(() => {
    if (user) {
      setUserName(user.name || user.email || "User");
      setUserRole(user.role || "developer");
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className="w-full border-b border-slate-200/80 bg-white shadow-sm"
      dir="ltr"
    >
      <div className="flex w-full items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-600 text-white shadow-sm sm:size-10">
            <img
              src="/Orbit_company-logo-en-white-01.png"
              alt="Orbit Logo"
              className="size-8 sm:size-9"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">Orbit</p>
            <p className="truncate text-[10px] text-slate-500 sm:text-xs">Task Manager</p>
          </div>
        </Link>

        <div className="flex max-w-[65%] flex-wrap items-center justify-end gap-2 sm:max-w-none sm:gap-3">
          {/* Role */}
          {isAuthenticated && (
            <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 sm:gap-2 sm:px-3">
              <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                Role:
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                userRole === "admin" ? "bg-rose-50 text-rose-700" :
                userRole === "editor" ? "bg-indigo-50 text-indigo-700" :
                "bg-slate-200 text-slate-700"
              }`}>
                {userRole}
              </span>
            </div>
          )}

          {/* User name + avatar */}
          <div className="flex items-center gap-2 border-l border-slate-100 pl-2.5 sm:gap-2.5 sm:pl-3">
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              {userName}
            </span>
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
              {getInitials(userName)}
            </div>
          </div>

          {/* Log out button */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 transition px-2 py-1 rounded-lg hover:bg-rose-50"
            >
              <i className="fa-solid fa-right-from-bracket mr-1"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
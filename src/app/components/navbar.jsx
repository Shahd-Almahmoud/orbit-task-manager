"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "universal-cookie";

export default function Navbar() {
  const cookie = new Cookies();
  const [currentRole, setCurrentRole] = useState("admin");
  const [userName, setUserName] = useState("Admin User");

  useEffect(() => {
    const role = cookie.get("mock_role") || "admin";
    setCurrentRole(role);
    if (role === "developer") setUserName("Ali Mansour");
    if (role === "editor") setUserName("Rama Ahmad");
    if (role === "admin") setUserName("Admin User");
  }, [currentRole]);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  const handleRoleChange = (newRole) => {
    cookie.set("mock_role", newRole, { path: "/" });
    setCurrentRole(newRole);
    window.location.reload();
  };

  return (
    <div
      className="w-full bg-white border-b border-slate-200/80 shadow-sm"
      dir="ltr"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-bold text-lg text-indigo-600 hover:text-indigo-700 transition"
          >
            Orbit
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            About
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Test Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="text-xs font-bold bg-transparent text-indigo-600 focus:outline-none cursor-pointer"
            >
              <option value="admin">Admin </option>
              <option value="editor">Editor </option>
              <option value="developer">Developer </option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              {userName}
            </span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
              {getInitials(userName)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Navbar() {
  const [currentRole, setCurrentRole] = useState("admin");
  const [userName, setUserName] = useState("Admin User");

  useEffect(() => {
    const role = Cookies.get("mock_role") || "admin";
    setCurrentRole(role);
    if (role === "developer") setUserName("Ali Mansour");
    if (role === "editor") setUserName("Rama Ahmad");
    if (role === "admin") setUserName("Admin User");
  }, [currentRole]);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  const handleRoleChange = (newRole) => {
    Cookies.set("mock_role", newRole, { path: "/" });
    setCurrentRole(newRole);
    window.location.reload();
  };
  return (
    <div
      className="w-full border-b border-slate-200/80 bg-white shadow-sm"
      dir="ltr"
    >
      <div className="flex w-full items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
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
        </div>

        <div className="flex max-w-[65%] flex-wrap items-center justify-end gap-2 sm:max-w-none sm:gap-3">
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 sm:gap-2 sm:px-3">
            <span className="hidden text-xs font-bold uppercase text-slate-500 sm:inline">
              Test Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="max-w-[6.5rem] cursor-pointer bg-transparent text-xs font-bold text-indigo-600 focus:outline-none sm:max-w-none"
            >
              <option value="admin">Admin </option>
              <option value="editor">Editor </option>
              <option value="developer">Developer </option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-100 pl-2.5 sm:gap-2.5 sm:pl-3">
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              {userName}
            </span>
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
              {getInitials(userName)}
            </div>
          </div>
        </div>        
      </div>
    </div>
  );
}
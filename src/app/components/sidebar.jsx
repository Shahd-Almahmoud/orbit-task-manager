"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 justify-center lg:justify-start text-center lg:text-left w-full";
    const activeClass = "bg-indigo-50 text-indigo-600 shadow-sm";
    const inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
    
    return `${baseClass} ${pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <div className="p-4 h-full bg-white">
      <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:space-y-1.5">
        <Link href="/dashboard" className={getLinkClass("/dashboard")}>
          <i className="fa-solid fa-chart-pie text-base"></i> Dashboard
        </Link>
        
        <Link href="/dashboard/projects" className={getLinkClass("/dashboard/projects")}>
          <i className="fa-solid fa-folder text-base"></i> Projects
        </Link>
        
        <Link href="/dashboard/task" className={getLinkClass("/dashboard/task")}>
          <i className="fa-solid fa-list-check text-base"></i> Tasks
        </Link>
        
        <Link href="/dashboard/users" className={getLinkClass("/dashboard/users")}>
          <i className="fa-solid fa-users-line text-base"></i> User Management
        </Link>
      </div>
    </div>
  );
}

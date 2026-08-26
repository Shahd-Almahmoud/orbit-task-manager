"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";

import {
  FaChartPie,
  FaFolder,
  FaHouse,
  FaListCheck,
  FaRightFromBracket,
  FaUsers,
} from "react-icons/fa6";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: FaChartPie },
  { title: "Projects", url: "/dashboard/projects", icon: FaFolder },
  { title: "Tasks", url: "/dashboard/task", icon: FaListCheck },
  { title: "User Management", url: "/dashboard/users", icon: FaUsers },
];
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const getLinkClass = (path) => {
    const baseClass =
      "group flex min-w-0 flex-1 shrink-0 items-center justify-center gap-3 rounded-xl px-1.5 py-3 text-center text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 md:min-w-14 md:flex-none md:w-full md:justify-start md:px-4 md:text-left";
    const activeClass = "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100";
    const inactiveClass =
      "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

    return `${baseClass} ${pathname === path ? activeClass : inactiveClass} `;
  };

  const handleLogout = () => {
    Cookies.remove("access_token", { path: "/" });
    Cookies.remove("user", { path: "/" });
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  return (
    <div className="flex h-full min-h-full flex-col bg-white p-3 sm:p-4">
      <div className="flex-1 pt-4 sm:pt-5">
        <p className="hidden px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 md:block">
          Menu
        </p>
        <nav className="flex gap-1 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-1 scrollbar-none sm:gap-2 sm:p-2 md:flex-col md:space-y-1 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:p-0">
          {items.map(({ title, url, icon: Icon }) => (
            <Link
              key={title}
              href={url}
              title={title}
              aria-label={title}
              aria-current={pathname === url ? "page" : undefined}
              className={getLinkClass(url)}
            >
              <Icon className="shrink-0 text-base" />
              <span className="hidden md:inline">{title}</span>
            </Link>
          ))}
          <Link
            href="/"
            title="Home"
            aria-label="Home"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`md:hidden ${getLinkClass("/")}`}
          >
            <FaHouse className="shrink-0 text-base" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="group flex min-w-0 flex-1 shrink-0 items-center justify-center gap-3 rounded-xl px-1.5 py-3 text-center text-sm font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 md:hidden"
          >
            <FaRightFromBracket className="shrink-0 text-base" />
          </button>
        </nav>
      </div>

      <div className="sticky bottom-0 hidden border-t border-slate-100 bg-white pt-3 md:flex md:flex-col md:pt-4 lg:block">
        <Link
          href="/"
          title="Home"
          aria-label="Home"
          aria-current={pathname === "/" ? "page" : undefined}
          className={getLinkClass("/")}
        >
          <FaHouse className="shrink-0 text-base" />
          <span className="hidden md:inline">Home</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="group flex min-w-14 shrink-0 flex-1 items-center justify-center gap-3 rounded-xl px-3 py-3 text-center text-sm font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 md:w-full md:justify-start md:px-4 md:text-left"
        >
          <FaRightFromBracket className="shrink-0 text-base" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

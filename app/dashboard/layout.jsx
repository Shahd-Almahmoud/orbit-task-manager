"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isClient, isLoading, isAuthenticated, router]);

  if (!isClient || isLoading) {
    return <div className="p-4 text-slate-500">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  //  الأدمن يتجاهل status
  if (user?.role !== "admin" && user?.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-slate-600 mb-6">
            Your account is currently pending admin approval.
          </p>
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full" dir="ltr">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 w-full items-stretch">
        <aside className="w-full md:w-64 bg-white border-r border-slate-200/60 shrink-0 min-h-fit md:min-h-screen">
          <Sidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[75vh]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { postReq } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await postReq("/me");
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  if (loading) {
    return <div className="p-4 text-slate-500">Loading Profile...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
        {error}
      </div>
    );
  }

  const userData = profile || user;

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto" dir="ltr">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
          <p className="text-sm text-slate-500 mt-1">View and manage your account details</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
      </div>

      {/* ✅ زرين من فوق */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/profile/edit"
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
        >
          <i className="fa-solid fa-pen"></i>
          Edit Profile
        </Link>
        <Link
          href="/dashboard/profile/change-password"
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
        >
          <i className="fa-solid fa-lock"></i>
          Change Password
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {userData?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{userData?.name || "Unknown"}</h3>
            <p className="text-sm text-slate-500">{userData?.email || ""}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Name</span>
            <span className="text-sm font-medium text-slate-800">{userData?.name || "-"}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Email</span>
            <span className="text-sm font-medium text-slate-800">{userData?.email || "-"}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Role</span>
            <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-md capitalize bg-indigo-50 text-indigo-700">
              {userData?.role || "-"}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Member Since</span>
            <span className="text-sm font-medium text-slate-800">
              {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
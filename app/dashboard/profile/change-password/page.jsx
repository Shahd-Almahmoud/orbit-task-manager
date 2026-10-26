"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { patchReq } from "@/lib/api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSending(true);

    try {
      await patchReq(
        `/users/${user?.id}/profile`,
        {
          current_password: form.currentPassword,
          password: form.newPassword,
          password_confirmation: form.confirmPassword,
        },
        { auth: true }
      );

      setSuccess("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1500);
      
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.message || 
        "Failed to reset password. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto" dir="ltr">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
        <Link href="/dashboard/profile" className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
          ← Back
        </Link>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm font-semibold rounded-xl border border-rose-100">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-xl border border-emerald-100">{success}</div>}

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <i className="fa-solid fa-circle-info text-blue-600 mt-0.5"></i>
          <div className="text-sm text-blue-700">
            <p className="font-medium">Updating password for:</p>
            <p className="mt-1"><strong>{user?.email}</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Current Password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Enter your current password"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="At least 8 characters"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Re-enter new password"
            />
          </div>

          <button type="submit" disabled={sending} className="w-full px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50">
            {sending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
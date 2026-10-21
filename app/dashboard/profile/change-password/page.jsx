"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { postReq } from "@/lib/api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");

    try {
      // ✅ POST /forgot-password
      await postReq(
        "/forgot-password",
        { email: user?.email },
        { auth: false }
      );

      setSuccess(
        "A password reset link has been sent to your email. " +
        "Please check your inbox and follow the link to reset your password."
      );
    } catch (err) {
      console.error("Error sending reset link:", err);
      setError(err.message || "Failed to send reset link.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto" dir="ltr">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
        <Link
          href="/dashboard/profile"
          className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition"
        >
          ← Back
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-600 text-sm font-semibold rounded-xl border border-rose-100">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-xl border border-emerald-100">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <i className="fa-solid fa-circle-info text-blue-600 mt-0.5"></i>
          <div className="text-sm text-blue-700">
            <p className="font-medium">How it works:</p>
            <p className="mt-1">
              We'll send a password reset link to <strong>{user?.email}</strong>.
              Click the link in your email to set a new password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={sending}
            className="w-full px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-paper-plane"></i>
            {sending ? "Sending..." : "Send Reset Link to My Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md text-center space-y-6">
       

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Password reset is currently handled by the administration. 
            Please contact your admin to reset your password.
          </p>
        </div>

        <div className="pt-2">
          <Link 
            href="/login" 
            className="inline-block w-full px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
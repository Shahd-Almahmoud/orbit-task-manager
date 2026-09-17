"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL;
      const res = await fetch(`${apiUrl}/forgot-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setMessage("the reset link has been sent to your email.");
    } catch (err) {
      setError("failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Forgot Password</h2>
        {message && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "sending..." : "send reset link"}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

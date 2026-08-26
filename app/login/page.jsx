"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://fakestoreapi.com/auth/login",
         {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Data not found");

      const data = await res.json();

      login(username, password);

      // Store the token in cookies for 7 days
      Cookies.set("access_token", data.token, { expires: 7 });
      router.push("/dashboard");
    } catch (err) {
      setError("Username or password is incorrect, please try again");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-md sm:p-8">
        <h2 className="mb-6 text-center text-xl font-bold sm:text-2xl">Login</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Doesn't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
        <Link
          href="/"
          className="mt-5 block border-t border-slate-100 pt-4 text-center text-sm text-slate-500 transition hover:text-blue-600 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

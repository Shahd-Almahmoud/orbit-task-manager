"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getReq, patchReq, updateReq } from "@/lib/api";

export default function EditUser() {
  const { id } = useParams();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getReq(`/users/${id}`);
        setUsername(user?.name || "");
        setEmail(user?.email || "");
        setRole(user?.role || "developer");
        setStatus(user?.status || "pending");
      } catch (err) {
        setError(err.message || "An error occurred while fetching the user");
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. تعديل الاسم والإيميل
      await patchReq(`/users/${id}/profile`, {
        name: username,
        email: email,
      });

      // 2. تعديل الدور
      await updateReq(`/users/${id}/role`, { role });

      // ✅ 3. تعديل الحالة
      await updateReq(`/users/${id}/status`, { status });

      setSuccess("User updated successfully!");
      setTimeout(() => router.push("/dashboard/users"), 1500);
    } catch (err) {
      setError(err.message || "An error occurred while updating the user");
    } finally {
      setLoading(false);
    }
  };

  // ✅ الأدمن يعيد تعيين كلمة السر — بدون current_password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setResettingPassword(true);
    setError("");
    setSuccess("");

    try {
      // ✅ بدون current_password
      await patchReq(`/users/${id}/profile`, {
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setResettingPassword(false);
    }
  };

  if (fetching) {
    return <div className="p-4 text-slate-500">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-lg p-1 sm:p-0">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link href="/dashboard/users" className="text-indigo-600 hover:underline">
          ← Back
        </Link>
        <h1 className="text-xl font-bold sm:text-2xl">Edit User</h1>
      </div>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>}
      {success && <div className="mb-4 p-2 bg-green-100 text-green-600 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-4 shadow sm:p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="developer">Developer</option>
          </select>
        </div>

        {/* ✅ حقل الحالة */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Account Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="pending">⏳ Pending (Waiting for approval)</option>
            <option value="active">✅ Active (Can access system)</option>
          </select>
          {status === "active" && (
            <p className="text-xs text-emerald-600 mt-1">
              ✅ User can access the system.
            </p>
          )}
          {status === "pending" && (
            <p className="text-xs text-amber-600 mt-1">
              ⏳ User cannot access the system until approved.
            </p>
          )}
        </div>

        {/* ✅ إعادة تعيين كلمة السر — بدون current_password */}
        <div className="mb-4 border-t border-slate-100 pt-4">
          <label className="block text-sm font-medium mb-2">
            Reset Password
          </label>
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              minLength={8}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resettingPassword || loading}
              className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50"
            >
              {resettingPassword ? "Updating password..." : "Reset Password"}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update User"}
          </button>
        </div>
      </form>
    </div>
  );
}
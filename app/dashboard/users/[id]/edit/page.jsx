"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getReq, patchReq, updateReq, deleteReq, postReq } from "@/lib/api";

export default function EditUser() {
  const { id } = useParams();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getReq(`/users/${id}`);
        setUsername(user?.name || "");
        setEmail(user?.email || "");
        setRole(user?.role || "developer");
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

      setSuccess("User updated successfully!");
      setTimeout(() => router.push("/dashboard/users"), 1500);
    } catch (err) {
      setError(err.message || "An error occurred while updating the user");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!confirm(`Send a password reset link to ${email}?`)) {
      return;
    }

    setSendingReset(true);
    setError("");
    setSuccess("");

    try {
      await postReq("/forgot-password", { email }, { auth: false });
      setSuccess(`Password reset link sent to ${email}`);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setSendingReset(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteReq(`/users/${id}`);
      setSuccess("User deleted successfully!");
      setTimeout(() => router.push("/dashboard/users"), 1500);
    } catch (err) {
      setError(err.message || "An error occurred while deleting the user");
    } finally {
      setDeleting(false);
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

        {/* ✅ Send Reset Link */}
        <div className="mb-4 border-t border-slate-100 pt-4">
          <label className="block text-sm font-medium mb-2">Password</label>
          <button
            type="button"
            onClick={handleSendResetLink}
            disabled={sendingReset}
            className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-paper-plane"></i>
            {sendingReset ? "Sending..." : "Send Password Reset Link"}
          </button>
          <p className="text-xs text-slate-500 mt-2">
            A password reset link will be emailed to <strong>{email}</strong>.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading || deleting}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update User"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
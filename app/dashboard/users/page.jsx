"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredToken, getStoredUser } from "@/lib/config";
import { deleteReq, getReq } from "@/lib/api";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [page, setPage] = useState(1);
  const router = useRouter();

  // Calculate total pages and visible users for pagination
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visibleUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token) {
      router.push("/login");
      return;
    }

    // Check if the user is an admin
    if (!user || user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        const list = await getReq("/users");
        setUsers(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || "An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setDeletingUserId(userId);
    setActionError("");

    try {
      await deleteReq(`/users/${userId}`);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (err) {
      setActionError(err.message || "An error occurred while deleting the user");
    } finally {
      setDeletingUserId(null);
    }
  };

  //  الأدمن يظهر "active" دائماً (ما يتأثر بـ pending)
  const getDisplayStatus = (user) => {
    if (user.role === "admin") return "active";
    return user.status || "pending";
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-1 sm:p-0">
      <div className="mb-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">User Management</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-160 w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visibleUsers.map((user) => {
                const displayStatus = getDisplayStatus(user);
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-center">{user.id}</td>
                    <td className="px-6 py-4 text-center">{user.name}</td>
                    <td className="px-6 py-4 text-center">{user.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                        {user.role || "developer"}
                      </span>
                    </td>
                    {/*  عرض الحالة — الأدمن يظهر active دائماً */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        displayStatus === "active" ? "bg-emerald-100 text-emerald-800" :
                        displayStatus === "pending" ? "bg-amber-100 text-amber-800" :
                        displayStatus === "suspended" ? "bg-red-100 text-red-800" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/users/${user.id}/edit`}
                          className="rounded-full border border-blue-950 bg-blue-100 px-4 py-1 text-xs transition hover:bg-blue-300 hover:text-blue-950"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingUserId === user.id}
                          className="rounded-full border border-red-700 bg-red-100 px-4 py-1 text-xs text-red-800 transition hover:bg-red-200 disabled:opacity-50"
                        >
                          {deletingUserId === user.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 p-4">
          <span className="inline-flex items-center text-sm text-slate-600">
            Page {page}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Previous Page
            </button>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
      {actionError && <p className="mt-4 text-sm text-red-600">{actionError}</p>}
    </div>
  );
}
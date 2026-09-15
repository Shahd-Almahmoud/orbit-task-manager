"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const userData = Cookies.get("user");
    if (!token) {
      router.push("/login");
      return;
    }
    // Check if the user is an admin
    const user = userData ? JSON.parse(userData) : null;
    if (!user || user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    const fetchUsers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
        const res = await fetch(`${apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const result = await res.json();
        setUsers(result.data || []);
      } catch (err) {
        setError("An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-1 sm:p-0">
      <div className="mb-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">User Management</h1>
        {/* <Link
          href="/dashboard/users/create"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-center text-white transition hover:bg-indigo-700 sm:w-auto"
        >
          + Add User
        </Link> */}
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-160 w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {user.role || "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4 ">
                    <span className="px-4 py-1 text-xs rounded-full border border-blue-950 bg-blue-100 hover:bg-blue-300 hover:text-blue-950 transition">
                      <Link href={`/dashboard/users/${user.id}/edit`}>
                        Edit
                      </Link>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

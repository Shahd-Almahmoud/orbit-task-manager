'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function EditUser() {
  const { id } = useParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL;
        const token = Cookies.get('token');
        const res = await fetch(`${apiUrl}/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const result = await res.json();
        const user = result.data || result;

        setUsername(user.name);
        setEmail(user.email);
        setRole(user.role || 'developer');
      } catch (err) {
        setError('An error occurred while fetching the user');
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL;
      const res = await fetch(`${apiUrl}/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error('Failed to update user');

      router.push('/dashboard/users');
    } catch (err) {
      setError('An error occurred while updating the user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg p-1 sm:p-0">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link href="/dashboard/users" className="text-indigo-600 hover:underline">
          ← Back
        </Link>
        <h1 className="text-xl font-bold sm:text-2xl">Edit User</h1>
      </div>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-4 shadow sm:p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="developer">Developer</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Role'}
        </button>
      </form>
    </div>
  );
}
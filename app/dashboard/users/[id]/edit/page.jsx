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
        const res = await fetch(`https://fakestoreapi.com/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUsername(data.username);
        setEmail(data.email);
        setRole(data.role || 'developer');
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
      const token = Cookies.get('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`https://fakestoreapi.com/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, role }),
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
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
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
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
}
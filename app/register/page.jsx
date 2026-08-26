'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://fakestoreapi.com/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      if (!res.ok) throw new Error('Failed to register');

      const data = await res.json();
      console.log('Registration data:', data);
      router.push('/login'); 
    } catch (err) {
      setError('Failed to register, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-md sm:p-8">
        <h2 className="mb-6 text-center text-xl font-bold sm:text-2xl">Create Account</h2>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-center">{error}</div>}
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account? <Link href="/login" className="text-blue-600">Login</Link>
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
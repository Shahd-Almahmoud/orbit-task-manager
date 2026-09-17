'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirmation) {
      setError('passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL;
      const res = await fetch(`${apiUrl}/reset-password`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');

      router.push('/login');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Reset Password</h2>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
            required
          />
          <input
            type="password"
            placeholder="confirm new password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
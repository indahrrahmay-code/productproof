
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="text-2xl font-bold text-blue-700">
          ProductProof<span className="text-gray-400">.</span>
        </Link>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage and verify your product passports.
          </p>

          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Demo sign in — no real authentication yet.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="font-medium text-blue-700 hover:underline">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </main>
  );
}

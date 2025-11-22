"use client";

import React, { useState } from "react";
import Link from "next/link";

async function login(loginId: string, password: string) {
  // Backend connection disabled for now - just for UI preview
  // Uncomment when backend is ready:
  /*
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginId, password }),
  });
  return res.json();
  */
  
  // Mock response for UI preview
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ error: "Backend not connected. This is a UI preview." });
    }, 500);
  });
}

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(loginId, password);
      if (result?.error) {
        setError(result.error);
      } else {
        // On success, navigate to home
        window.location.href = "/";
      }
    } catch {
      setError("Invalid login ID or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-indigo-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold shadow-lg">
            IM
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login ID Input */}
            <div>
              <label
                htmlFor="loginId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Login ID
              </label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your login ID"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <Link
                href="/forgot-password"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Forgot password?
              </Link>
              <span className="hidden sm:inline text-gray-400">|</span>
              <Link
                href="/signup"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Signup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

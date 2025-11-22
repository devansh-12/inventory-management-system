"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

async function login(loginId: string, password: string): Promise<LoginResponse> {
  // Mock response for UI preview
  return new Promise<LoginResponse>((resolve) => {
    setTimeout(() => {
      resolve({ error: "Backend not connected. This is a UI preview." });
    }, 500);
  });
}

interface LoginResponse {
  error?: string;
  // Add other properties you expect in the response, e.g., user info
}

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    loginId?: string;
    password?: string;
  }>({});

  const validateLoginId = (id: string): string | undefined => {
    if (id.length > 0 && id.length < 3) {
      return "Login ID must be at least 3 characters";
    }
    return undefined;
  };

  const validatePassword = (pwd: string): string | undefined => {
    if (pwd.length > 0 && pwd.length < 3) {
      return "Password must be at least 3 characters";
    }
    return undefined;
  };

  const handleLoginIdChange = (value: string) => {
    setLoginId(value);
    const error = validateLoginId(value);
    setFieldErrors((prev) => ({ ...prev, loginId: error }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const error = validatePassword(value);
    setFieldErrors((prev) => ({ ...prev, password: error }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  // Final validation
  const loginIdError = validateLoginId(loginId);
  const passwordError = validatePassword(password);
  
  if (loginIdError || passwordError) {
    setFieldErrors({
      loginId: loginIdError,
      password: passwordError,
    });
    setLoading(false);
    return;
  }

  try {
    const result: LoginResponse = await login(loginId, password);
    if (result?.error) {
      setError(result.error);
    } else {
      // On success, navigate to home
      router.push("/");
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
                onChange={(e) => handleLoginIdChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 ${
                  fieldErrors.loginId ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your login ID"
                required
              />
              {fieldErrors.loginId && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.loginId}</p>
              )}
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
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 ${
                  fieldErrors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your password"
                required
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
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
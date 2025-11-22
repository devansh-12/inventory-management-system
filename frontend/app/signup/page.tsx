"use client";

import React, { useState } from "react";
import Link from "next/link";

async function signup(loginId: string, email: string, password: string) {
  // Backend connection disabled for now - just for UI preview
  // Uncomment when backend is ready:
  /*
  const res = await fetch("http://localhost:5000/auth/signup", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginId, email, password }),
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

export default function SignupPage() {
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    loginId?: string;
    email?: string;
    password?: string;
    reEnterPassword?: string;
    general?: string;
  }>({});

  const validateLoginId = (id: string): string | undefined => {
    if (id.length < 6 || id.length > 12) {
      return "Login ID must be between 6 and 12 characters";
    }
    return undefined;
  };

  const validatePassword = (pwd: string): string | undefined => {
    if (pwd.length > 8) {
      return "Password must not be more than 8 characters";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate all fields
    const loginIdError = validateLoginId(loginId);
    const passwordError = validatePassword(password);
    const reEnterPasswordError =
      password !== reEnterPassword ? "Passwords do not match" : undefined;

    if (loginIdError || passwordError || reEnterPasswordError) {
      setErrors({
        loginId: loginIdError,
        password: passwordError,
        reEnterPassword: reEnterPasswordError,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await signup(loginId, email, password);
      if (result?.error) {
        if (result.error.includes("email") || result.error.includes("duplicate")) {
          setErrors({ email: "Email already exists" });
        } else {
          setErrors({ general: result.error });
        }
      } else {
        // On success, navigate to login
        window.location.href = "/login";
      }
    } catch (error) {
      setErrors({ general: "Signup failed. Please try again." });
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

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Sign Up
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login ID Input */}
            <div>
              <label
                htmlFor="loginId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Login ID
              </label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  if (errors.loginId) {
                    setErrors((prev) => ({ ...prev, loginId: undefined }));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  errors.loginId ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="6-12 characters"
                required
              />
              {errors.loginId && (
                <p className="mt-1 text-sm text-red-600">{errors.loginId}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Email ID
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  errors.password ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Max 8 chars, uppercase & lowercase"
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Re-enter Password Input */}
            <div>
              <label
                htmlFor="reEnterPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Re-enter Password
              </label>
              <input
                id="reEnterPassword"
                type="password"
                value={reEnterPassword}
                onChange={(e) => {
                  setReEnterPassword(e.target.value);
                  if (errors.reEnterPassword) {
                    setErrors((prev) => ({ ...prev, reEnterPassword: undefined }));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  errors.reEnterPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Re-enter your password"
                required
              />
              {errors.reEnterPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.reEnterPassword}
                </p>
              )}
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


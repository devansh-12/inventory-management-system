"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SignupResponse {
  error?: string;
  // Add any other properties you expect in the response if needed
}

async function signup(loginId: string, email: string, password: string, role: string): Promise<SignupResponse> {
  // Mock response for UI preview
  console.log("Mock signup with role:", role); // Log role for UI preview
  return new Promise<SignupResponse>((resolve) => {
    setTimeout(() => {
      resolve({ error: "Backend not connected. This is a UI preview." });
    }, 500);
  });
}

export default function SignupPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    loginId?: string;
    email?: string;
    password?: string;
    reEnterPassword?: string;
    role?: string;
    general?: string;
  }>({});

  const validateLoginId = (id: string): string | undefined => {
    if (id.length === 0) {
      return undefined; // Don't show error for empty field while typing
    }
    if (id.length < 6 || id.length > 12) {
      return "Login ID must be between 6 and 12 characters";
    }
    return undefined;
  };

  const validatePassword = (pwd: string): string | undefined => {
    if (pwd.length === 0) {
      return undefined; // Don't show error for empty field while typing
    }
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

  const validateEmail = (email: string): string | undefined => {
    if (email.length === 0) {
      return undefined; // Don't show error for empty field while typing
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validateReEnterPassword = (pwd: string, originalPwd: string): string | undefined => {
    if (pwd.length === 0) {
      return undefined; // Don't show error for empty field while typing
    }
    if (pwd !== originalPwd) {
      return "Passwords do not match";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});

  // Validate all fields
  const loginIdError = validateLoginId(loginId);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const reEnterPasswordError = validateReEnterPassword(reEnterPassword, password);
  const roleError = !role ? "Please select a role" : undefined;

  if (loginIdError || emailError || passwordError || reEnterPasswordError || roleError) {
    setErrors({
      loginId: loginIdError,
      email: emailError,
      password: passwordError,
      reEnterPassword: reEnterPasswordError,
      role: roleError,
    });
    return;
  }

  setLoading(true);
  try {
    const result: SignupResponse = await signup(loginId, email, password, role);
    if (result?.error) {
      if (result.error.includes("email") || result.error.includes("duplicate")) {
        setErrors({ email: "Email already exists" });
      } else {
        setErrors({ general: result.error });
      }
    } else {
      // On success, navigate to login
      router.push("/login");
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
                  const value = e.target.value;
                  setLoginId(value);
                  const error = validateLoginId(value);
                  setErrors((prev) => ({ ...prev, loginId: error }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-gray-900 ${
                  errors.loginId ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
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
                  const value = e.target.value;
                  setEmail(value);
                  const error = validateEmail(value);
                  setErrors((prev) => ({ ...prev, email: error }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-gray-900 ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                }`}
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Role Dropdown */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  const value = e.target.value;
                  setRole(value);
                  const error = !value ? "Please select a role" : undefined;
                  setErrors((prev) => ({ ...prev, role: error }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-gray-900 ${
                  errors.role ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                }`}
                required
              >
                <option value="">Select a role</option>
                <option value="inventory manager">Inventory Manager</option>
                <option value="warehouse staff">Warehouse Staff</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
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
                  const value = e.target.value;
                  setPassword(value);
                  const error = validatePassword(value);
                  setErrors((prev) => ({ ...prev, password: error }));
                  // Also re-validate re-enter password if it has a value
                  if (reEnterPassword) {
                    const reEnterError = validateReEnterPassword(reEnterPassword, value);
                    setErrors((prev) => ({ ...prev, reEnterPassword: reEnterError }));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-gray-900 ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
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
                  const value = e.target.value;
                  setReEnterPassword(value);
                  const error = validateReEnterPassword(value, password);
                  setErrors((prev) => ({ ...prev, reEnterPassword: error }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-gray-900 ${
                  errors.reEnterPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
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

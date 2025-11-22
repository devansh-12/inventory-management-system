"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get("email") || "";

    const [email, setEmail] = React.useState(emailFromUrl);
    const [otp, setOtp] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            setLoading(false);
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/auth/reset-password", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: data.message || "Password reset successfully!" });
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                setMessage({ type: "error", text: data.error || "Failed to reset password" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Network error. Please try again." });
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

                {/* Reset Password Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
                        Reset Password
                    </h1>
                    <p className="text-gray-600 text-center mb-8">
                        Enter the OTP sent to your email and your new password
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                placeholder="you@example.com"
                                disabled={loading}
                            />
                        </div>

                        {/* OTP Input */}
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                OTP Code
                            </label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                pattern="[0-9]{6}"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono text-gray-900"
                                placeholder="000000"
                                disabled={loading}
                            />
                        </div>

                        {/* New Password Input */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                placeholder="Enter new password"
                                disabled={loading}
                            />
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                placeholder="Confirm new password"
                                disabled={loading}
                            />
                        </div>

                        {/* Message Display */}
                        {message && (
                            <div
                                className={`p-4 rounded-lg ${message.type === "success"
                                    ? "bg-green-50 text-green-800 border border-green-200"
                                    : "bg-red-50 text-red-800 border border-red-200"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>

                    {/* Back to Sign In */}
                    <div className="text-center mt-6">
                        <Link
                            href="/login"
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

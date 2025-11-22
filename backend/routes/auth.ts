import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db";
import { signToken } from "../utils/jwt";
import { sendPasswordResetEmail } from "../utils/email";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        res.status(400).json({ error: "Email, password, and name are required" });
        return;
    }

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            res.status(400).json({ error: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, role",
            [email, hashedPassword, name]
        );
        const user = result.rows[0];

        const token = signToken({ id: user.id, email: user.email });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({ user });
    } catch (error) {
        console.error("Register error details:", error);
        res.status(500).json({ error: "Internal server error", details: (error as any).message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user || !user.password) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const token = signToken({ id: user.id, email: user.email });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            // Do not reveal if user exists
            console.log("Forgot password requested for non-existent email:", email);
            res.status(200).json({ message: "If an account with that email exists, we sent you a reset code." });
            return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        await pool.query(
            "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)",
            [email, otp, expiresAt]
        );

        // Send email with OTP
        try {
            await sendPasswordResetEmail(email, otp);
        } catch (emailError) {
            console.error("Failed to send password reset email:", emailError);
            // Continue execution - don't reveal email sending failure to prevent enumeration
        }

        res.status(200).json({ message: "If an account with that email exists, we sent you a reset code." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        res.status(400).json({ error: "Email, OTP, and new password are required" });
        return;
    }

    try {
        // Verify OTP
        const tokenResult = await pool.query(
            "SELECT * FROM password_reset_tokens WHERE email = $1 AND token = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            [email, otp]
        );

        if (tokenResult.rows.length === 0) {
            res.status(400).json({ error: "Invalid or expired OTP" });
            return;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

        // Delete used OTPs for this email
        await pool.query("DELETE FROM password_reset_tokens WHERE email = $1", [email]);

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

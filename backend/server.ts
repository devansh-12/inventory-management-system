import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();

app.use(express.json());
app.use(cookieParser());

// Allow cookies from frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// Import routes
import receiptRoutes from "./routes/receiptRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import moveHistoryRoutes from "./routes/moveHistoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";

app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/move-history", moveHistoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api", warehouseRoutes);

// Auth routes
import { signToken, verifyToken } from "./utils/jwt.js";

// Login endpoint
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout endpoint
app.post("/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Get current user endpoint
app.get("/auth/me", async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = verifyToken(token) as any;

    const result = await pool.query("SELECT id, email, name FROM users WHERE id = $1", [
      decoded.id,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(5000, () => console.log("Backend running on 5000"));

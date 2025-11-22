import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ExpressAuth } from "@auth/express"
import NeonAdapter from "@auth/neon-adapter"
import Credentials from "@auth/express/providers/credentials"
import { Pool } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

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

// Signup endpoint
app.post("/auth/signup", async (req, res) => {
  try {
    const { loginId, email, password } = req.body;

    if (!loginId || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email already exists
    const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [loginId, email, hashedPassword]
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
app.post("/auth/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: "Login ID and password are required" });
    }

    // Try to find user by login ID (name field) or email
    const result = await pool.query(
      "SELECT * FROM users WHERE name = $1 OR email = $1",
      [loginId]
    );
    const user = result.rows[0];

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid login ID or password" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid login ID or password" });
    }

    // Use ExpressAuth for session management
    // For now, return success - session will be handled by ExpressAuth if needed
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/auth/*", ExpressAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const result = await pool.query("SELECT * FROM users WHERE email = $1", [
            credentials.email,
          ])
          const user = result.rows[0]

          if (!user || !user.password) {
            return null
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValid) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  adapter: NeonAdapter(pool),
  session: { strategy: "jwt" }, // Use JWT for session strategy with Credentials provider
}));

app.listen(5000, () => console.log("Backend running on 5000"));

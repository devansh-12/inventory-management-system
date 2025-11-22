import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
// Import routes
import receiptRoutes from "./routes/receiptRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import moveHistoryRoutes from "./routes/moveHistoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";


const pool = new Pool({ connectionString: process.env.DATABASE_URL });


const app = express();

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Custom JSON parser with better error handling
app.use(express.json({
  verify: (req: any, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString());
    } catch (e: any) {
      console.error('JSON Parse Error - Raw body:', buf.toString());
      console.error('Error:', e.message);
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(cookieParser());

// Allow cookies from frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);


app.use("/auth", authRoutes);

// Error handling middleware - must be after routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'entity.parse.failed' || err.message === 'Invalid JSON') {
    console.error('Failed to parse JSON from request');
    console.error('URL:', req.url);
    console.error('Method:', req.method);
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

console.log("Attempting to start server...");
const server = app.listen(5000, () => console.log("Backend running on 5000"));


app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/move-history", moveHistoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api", warehouseRoutes);
app.use("/api/contacts", contactRoutes);

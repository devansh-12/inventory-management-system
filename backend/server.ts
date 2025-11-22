import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);


app.use("/auth", authRoutes);


console.log("Attempting to start server...");
const server = app.listen(6000, () => console.log("Backend running on 5000"));

server.on("error", (err) => {
  console.error("Failed to start server:", err);
});

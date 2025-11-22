import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

export default function auth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.token;

  // Step 1: Try Authorization header
  if (!token && req.headers.authorization) {
    const [type, value] = req.headers.authorization.split(" ");
    if (type === "Bearer") token = value;
  }

  // Step 2: DEV MODE BYPASS — accept "default-secret"
  if (token === "default-secret") {
    (req as AuthRequest).user = { id: 1 }; // Use numeric ID for database compatibility
    return next();
  }

  // Step 3: If still no token → reject
  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  // Step 4: Validate JWT
  try {
    const decoded = verifyToken(token);
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

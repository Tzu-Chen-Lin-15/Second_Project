import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export type JwtUser = { id: number; email: string; role?: "USER" | "ADMIN" };

export function requireAuth(
  req: Request & { user?: JwtUser },
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "缺少 token" });
  }
  const token = auth.split(" ")[1];
  try {
    req.user = verifyToken<JwtUser>(token);
    next();
  } catch {
    return res.status(401).json({ message: "無效或過期的 token" });
  }
}

export function requireAdmin(
  req: Request & { user?: JwtUser },
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "需要管理員權限" });
  }
  next();
}

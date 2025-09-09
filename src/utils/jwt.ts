import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(payload: object, expiresIn = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}

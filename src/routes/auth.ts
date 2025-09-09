import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";
import { signToken } from "../utils/jwt.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

/** POST /api/auth/register
 * body: { email, password, name?, phone? }
 */
router.post("/register", async (req, res) => {
  const { email, password, name, phone } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "缺少 email 或 password" });
  }

  const existed = await prisma.user.findUnique({ where: { email } });
  if (existed) return res.status(409).json({ message: "Email 已被註冊" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name: name ?? null, phone: phone ?? null },
    select: { id: true, email: true, name: true, phone: true },
  });

  // 先給 USER 角色；未來你的 User 有 role 欄位時再改成讀 DB 的值
  const token = signToken({ id: user.id, email: user.email, role: "USER" });
  res.json({ user, token });
});

/** POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "缺少 email 或 password" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "帳號或密碼錯誤" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "帳號或密碼錯誤" });

  const token = signToken({ id: user.id, email: user.email, role: "USER" });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
    token,
  });
});

/** GET /api/auth/me  (需要 Authorization: Bearer <token>) */
router.get("/me", requireAuth, async (req, res) => {
  const u = (req as any).user as { id: number };
  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, email: true, name: true, phone: true },
  });
  res.json(user);
});

export default router;

import "dotenv/config";
import express from "express";
import cors from "cors";

// 匯入路由與中介層（注意 ESM 要帶 .js）
import authRouter from "./routes/auth.js";
import hotelsRouter from "./routes/hotels.js";
import bookingsRouter from "./routes/bookings.js";
import adminRoomTypes from "./routes/admin.roomTypes.js";
import { requireAuth, requireAdmin } from "./middlewares/auth.js";

const app = express();

// 中介層：JSON / URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 設定（允許 Vite 前端）
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // 你的前端開發位址
    credentials: true,
  })
);

// 健康檢查
app.get("/", (_req, res) => {
  res.json({ ok: true, name: "booking-api", version: "1.0.0" });
});

// --- 路由掛載 ---

// Auth（註冊/登入/取得自己）
app.use("/api/auth", authRouter);

// 前台 API
app.use("/api/hotels", hotelsRouter);

// 訂單 → 要登入才能使用
app.use("/api/bookings", requireAuth, bookingsRouter);

// 後台房型管理 → 要登入 + 管理員
app.use("/api/admin/room-types", requireAuth, requireAdmin, adminRoomTypes);

// 404 處理
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// 統一錯誤處理
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
);

// 啟動伺服器
const PORT = Number(process.env.PORT) || 3007;
app.listen(PORT, () =>
  console.log(`API server running at http://localhost:${PORT}`)
);

import { Router } from "express";
import { prisma } from "../utils/prisma.js"; // ESM 模式要有 .js 副檔名

const router = Router();

/**
 * POST /api/bookings
 * 建立訂單（最小可用版）
 * body:
 * {
 *   userId: number,
 *   roomTypeId: number,
 *   checkIn: "YYYY-MM-DD",
 *   checkOut: "YYYY-MM-DD",
 *   guests: number,
 *   contactName: string,
 *   contactPhone: string
 * }
 */
router.post("/", async (req, res) => {
  const {
    userId,
    roomTypeId,
    checkIn,
    checkOut,
    guests,
    contactName,
    contactPhone,
  } = req.body || {};

  // 1) 基本欄位檢查
  if (
    !userId ||
    !roomTypeId ||
    !checkIn ||
    !checkOut ||
    !contactName ||
    !contactPhone
  ) {
    return res.status(400).json({ message: "缺少必要欄位" });
  }

  // 2) 將 YYYY-MM-DD 轉為 UTC 日期（避免時區解析歧義）
  const ci = new Date(`${checkIn}T00:00:00.000Z`);
  const co = new Date(`${checkOut}T00:00:00.000Z`);
  if (!(ci < co)) return res.status(400).json({ message: "日期範圍錯誤" });

  // 3) 確認房型存在且為上架狀態（isActive = true）
  const rt = await prisma.roomType.findUnique({
    where: { id: Number(roomTypeId) },
  });
  if (!rt || rt.isActive === false) {
    return res.status(400).json({ message: "房型不存在或未上架" });
  }

  // 4) 檢查日期重疊（只計算已確認的訂單）
  //    交集判斷邏輯：任兩區間 [A,B) 與 [C,D) 有重疊 <=> NOT( B <= C or A >= D )
  const overlap = await prisma.booking.count({
    where: {
      roomTypeId: rt.id,
      status: "CONFIRMED",
      NOT: [{ checkOut: { lte: ci } }, { checkIn: { gte: co } }],
    },
  });

  // 5) 若已滿，回 409 衝突
  if (overlap >= rt.total) {
    return res.status(409).json({ message: "已售完" });
  }

  // 6) 建立訂單（最小流程：直接 CONFIRMED）
  const created = await prisma.booking.create({
    data: {
      userId: Number(userId),
      roomTypeId: rt.id,
      checkIn: ci,
      checkOut: co,
      guests: Number(guests) || 1,
      contactName,
      contactPhone,
      status: "CONFIRMED",
    },
  });

  res.json(created);
});

/**
 * GET /api/bookings/me?userId=1
 * 取得某使用者的歷史訂單（暫用 query 帶 userId；未做 JWT）
 */
router.get("/me", async (req, res) => {
  const userId = Number(req.query.userId);
  if (!Number.isInteger(userId))
    return res.status(400).json({ message: "Invalid userId" });

  const rows = await prisma.booking.findMany({
    where: { userId },
    include: { roomType: { include: { hotel: true } } }, // 附上房型與飯店資訊，前端好顯示
    orderBy: { createdAt: "desc" },
  });

  res.json(rows);
});

export default router;

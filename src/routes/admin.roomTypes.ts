import { Router } from "express";
import { prisma } from "../utils/prisma.js";

const router = Router();

/**
 * GET /api/admin/room-types?hotelId=1&isActive=true&in=YYYY-MM-DD&out=YYYY-MM-DD
 *
 * 功能：
 * 1) 不帶 in/out → 純管理列表（含上架狀態、價格、庫存）
 * 2) 帶 in/out → 加算 remaining（只扣 CONFIRMED 的重疊訂單），等於「前台預覽」
 *
 * 參數：
 * - hotelId?: number        篩選某飯店
 * - isActive?: boolean      篩選上架/下架
 * - in?: string             入住日 YYYY-MM-DD
 * - out?: string            退房日 YYYY-MM-DD
 */
router.get("/", async (req, res) => {
  const hotelId = req.query.hotelId ? Number(req.query.hotelId) : undefined;
  const isActive =
    typeof req.query.isActive === "string"
      ? req.query.isActive === "true"
      : undefined;

  const inStr = typeof req.query.in === "string" ? req.query.in : undefined;
  const outStr = typeof req.query.out === "string" ? req.query.out : undefined;

  // 先把房型抓出來（管理列表基礎）
  const rows = await prisma.roomType.findMany({
    where: { hotelId, isActive },
    include: { hotel: true },
    orderBy: { updatedAt: "desc" },
  });

  // 沒帶日期 → 直接回管理列表
  if (!inStr || !outStr) {
    return res.json(
      rows.map((r) => ({
        ...r,
        remaining: null, // 未帶日期不計算
        soldOut: null,
      }))
    );
  }

  // 帶日期 → 做「前台預覽」剩餘數計算
  const ci = new Date(`${inStr}T00:00:00.000Z`);
  const co = new Date(`${outStr}T00:00:00.000Z`);
  if (!(ci < co)) return res.status(400).json({ message: "日期範圍錯誤" });

  // 對每個房型計算重疊訂單數（只扣 CONFIRMED）
  const augmented = await Promise.all(
    rows.map(async (rt) => {
      const overlap = await prisma.booking.count({
        where: {
          roomTypeId: rt.id,
          status: "CONFIRMED",
          // 重疊條件： NOT( 舊.checkout <= 新.checkin OR 舊.checkin >= 新.checkout )
          NOT: [{ checkOut: { lte: ci } }, { checkIn: { gte: co } }],
        },
      });
      const remaining = rt.total - overlap;
      return {
        ...rt,
        remaining,
        soldOut: remaining <= 0,
      };
    })
  );

  res.json(augmented);
});

/** POST /api/admin/room-types  { hotelId, name, price, total, isActive? } */
router.post("/", async (req, res) => {
  const { hotelId, name, price, total, isActive = true } = req.body || {};
  if (
    !hotelId ||
    !name ||
    !Number.isFinite(price) ||
    !Number.isInteger(total)
  ) {
    return res.status(400).json({ message: "缺少必要欄位" });
  }
  const created = await prisma.roomType.create({
    data: {
      hotelId: Number(hotelId),
      name,
      price: Number(price),
      total: Number(total),
      isActive: !!isActive,
    },
  });
  res.json(created);
});

/** PATCH /api/admin/room-types/:id/price  { price } */
router.patch("/:id/price", async (req, res) => {
  const id = Number(req.params.id);
  const { price } = req.body || {};
  if (!Number.isFinite(price) || price <= 0)
    return res.status(400).json({ message: "Invalid price" });
  const updated = await prisma.roomType.update({
    where: { id },
    data: { price: Number(price) },
  });
  res.json(updated);
});

/** PATCH /api/admin/room-types/:id/status  { isActive } */
router.patch("/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { isActive } = req.body as { isActive: boolean };
  const updated = await prisma.roomType.update({
    where: { id },
    data: { isActive: !!isActive },
  });
  res.json(updated);
});

/** PATCH /api/admin/room-types/:id/stock  { total } */
router.patch("/:id/stock", async (req, res) => {
  const id = Number(req.params.id);
  const { total } = req.body || {};
  if (!Number.isInteger(total) || total < 0)
    return res.status(400).json({ message: "Invalid total" });
  const updated = await prisma.roomType.update({
    where: { id },
    data: { total: Number(total) },
  });
  res.json(updated);
});

export default router;

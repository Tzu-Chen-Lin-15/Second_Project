import { Router } from "express";
// import { prisma } from "../utils/prisma.js";
import { prisma } from "../utils/prisma-pagination.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const hotels = await prisma.hotel.findMany({
      skip: (page - 1) * limit, //跳過前面 n 筆
      take: limit,
      include: { images: true, roomTypes: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(hotels);
  } catch (err) {
    console.log("查詢飯店失敗:", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});
/** GET /api/hotels?city=Taipei
 * 回傳飯店列表（封面圖、房型數）
 */
// router.get("/", async (req, res) => {
//   const city = typeof req.query.city === "string" ? req.query.city : undefined;

//   const hotels = await prisma.hotel.findMany({
//     where: city ? { city } : {},
//     select: {
//       id: true,
//       name: true,
//       city: true,
//       address: true,
//       description: true,
//       images: {
//         select: { url: true, sortOrder: true },
//         orderBy: { sortOrder: "asc" },
//         take: 1,
//       },
//       _count: { select: { roomTypes: true } },
//     },
//     orderBy: { id: "asc" },
//   });

//   res.json(
//     hotels.map((h) => ({
//       id: h.id,
//       name: h.name,
//       city: h.city,
//       address: h.address,
//       description: h.description,
//       coverUrl: h.images[0]?.url ?? null,
//       roomTypeCount: h._count.roomTypes,
//     }))
//   );
// });

// /** GET /api/hotels/:id
//  * 回傳飯店詳情（含所有圖片、僅 isActive=true 的房型）
//  */
// router.get("/:id", async (req, res) => {
//   const id = Number(req.params.id);
//   if (!Number.isInteger(id))
//     return res.status(400).json({ message: "Invalid id" });

//   const hotel = await prisma.hotel.findUnique({
//     where: { id },
//     include: {
//       images: { orderBy: { sortOrder: "asc" } },
//       roomTypes: { where: { isActive: true } }, // 前台只顯示上架房型
//     },
//   });

//   if (!hotel) return res.status(404).json({ message: "Not found" });
//   res.json(hotel);
// });

export default router;

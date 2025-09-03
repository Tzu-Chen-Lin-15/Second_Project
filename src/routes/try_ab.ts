import express from "express";
import type { Request, Response, NextFunction } from "express";
// import { prisma } from "../utils/prisma-only.js";
import { prisma } from "../utils/prisma-pagination.js";

const router = express.Router();
router.get("/where-1", async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({
    where: {
      email: "diego75@gmail.com",
    },
  });
  res.json(contacts);
});
router.get("/where-3", async (req: Request, res: Response) => {
  const beginBirth = new Date("1960-01-01 00:00:00");
  const endBirth = new Date("1970-01-01 00:00:00");
  const contacts = await prisma.contact.findMany({
    where: {
      AND: [
        { birthday: { gte: beginBirth, lt: endBirth } },
        { name: "林柏翰" },
      ],
      OR: [],
      NOT: [{ address: "花蓮縣" }],
    },
  });
  res.json(contacts);
});
router.get("/where-4", async (req: Request, res: Response) => {
  const beginBirth = new Date("1995-01-01 00:00:00");
  const contacts = await prisma.contact.findMany({
    select: {
      ab_id: true,
      name: true,
      email: true,
      mobile: true,
      address: true,
    },
    where: {
      birthday: { gte: beginBirth },
      email: { contains: "@gmail.com" },
      address: { in: ["宜蘭縣", "⾼雄市"] },
    },
  });
  res.json(contacts);
});

router.get("/where-6", async (req: Request, res: Response) => {
  const members = await prisma.member.findMany({
    where: {
      favorites: { some: {} },
    },
  });
  res.json(members);
});
router.get("/order-by", async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({
    where: {
      name: { in: ["劉佳穎", "鄭雅筑", "林柏翰"] },
    },
    orderBy: [{ name: "asc" }, { birthday: "desc" }],
  });
  res.json(contacts);
});

router.get("/take-skip/:page", async (req: Request, res: Response) => {
  const perPage = 12; // 每頁有幾筆資料
  let page = parseInt(req.params.page) || 1;
  if (page < 1) page = 1;

  const contacts = await prisma.contact.findMany({
    take: perPage,
    skip: (page - 1) * perPage,
  });
  res.json(contacts);
});

router.get("/count", async (req: Request, res: Response) => {
  const totalContacts = await prisma.contact.count();
  const aggregate = await prisma.contact.aggregate({
    _avg: { ab_id: true },
    _count: { ab_id: true },
    _sum: { ab_id: true },
    _min: { ab_id: true },
    _max: { ab_id: true },
  });
  res.json({ totalContacts, aggregate });
});

router.get("/include", async (req: Request, res: Response) => {
  const members = await prisma.member.findMany({
    where: {
      favorites: { some: {} },
    },
    include: {
      favorites: {
        include: {
          contact: true,
        },
      },
    },
  });
  res.json(members);
});

router.get("/pagination", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  if (page < 1) {
    res.redirect(`?page=1`);
    return;
  }
  const [contacts, meta] = await prisma.contact
    .paginate({
      orderBy: [{ ab_id: "desc" }],
    })
    .withPages({
      page,
      limit,
    });

  res.json({ contacts, meta });
});
export default router;

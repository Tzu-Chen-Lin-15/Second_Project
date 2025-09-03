import express from "express";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma-only.js";

const router = express.Router();

router.get("/create", async (req: Request, res: Response) => {
  try {
    // create() 新增一筆
    const user = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Lee",
        email: "john@ttt.com",
      },
    });

    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
});

router.get("/read/:user_id", async (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id) || 1;
  try {
    // 讀取一筆
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
    res.json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});
router.get("/update/:user_id", async (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id) || 1;
  try {
    const user = await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        firstName: "一袋米",
      },
    });
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
});
router.get("/delete/:user_id", async (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id) || 1;
  try {
    const user = await prisma.user.delete({
      where: {
        id: user_id,
      },
    });
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
});

export default router;

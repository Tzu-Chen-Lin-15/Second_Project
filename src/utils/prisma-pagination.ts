import { PrismaClient } from "../generated/prisma/index.js";
import { pagination } from "prisma-extension-pagination";

export const prisma = new PrismaClient().$extends(
  pagination({
    pages: {
      limit: 6, // 預設每⾴筆數
      includePageCount: true, // 是否包含總⾴數
    },
  })
);

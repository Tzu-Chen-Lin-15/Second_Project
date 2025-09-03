import { PrismaClient } from "../generated/prisma/index.js";
import { pagination } from "prisma-extension-pagination";

export const prisma = new PrismaClient().$extends(
  pagination({
    pages: {
      limit: 25,
      includePageCount: true,
    },
  })
);

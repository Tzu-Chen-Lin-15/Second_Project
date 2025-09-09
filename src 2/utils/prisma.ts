// ESM 模式下，記得加上 .js 副檔名
import { PrismaClient } from "../generated/prisma/index.js";

export const prisma = new PrismaClient();

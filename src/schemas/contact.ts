import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(2, "姓名至少需要兩個字"),
  email: z.email({ message: "請輸入有效的電子郵件格式" }),
  mobile: z.string().optional(),
  address: z.string().optional(),
  birthday: z.iso.date().optional().or(z.literal("")),
  created_at: z.iso.datetime().optional(),
});
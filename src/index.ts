import express from "express";
import type { Request, Response } from "express";
import "dotenv/config";
import usersRouter from "./routes/users.js";
import tryABRouter from "./routes/try_ab.js";
import apiContactsRouter from "./routes/api-contacts.js";
import { z } from "zod";
import session from "express-session";
import sessionFileStore from "session-file-store";
import cors from "cors";
import upload from "./utils/upload-images.js"

const FileStore = sessionFileStore(session);

const app = express();

// 設定使用 EJS 為樣版引擎
app.set("view engine", "ejs");

// 設定靜態內容資料夾
app.use(express.static("public"));
// 解析 JSON body 的中間件
app.use(express.json());
// 解析 URL-encoded body 的中間件
app.use(express.urlencoded({ extended: true }));
// app.use(cors()); // 最基本的設定方式, 誇來源時沒有要使用 cookie

app.use(
  cors({
    origin: function (origin: string | undefined, callback) {
      // console.log({ origin });

      if (!origin) {
        callback(null, true); // 沒有 origin 檔頭時
        return;
      }
      callback(null, true); // 所有都允許
    },
    credentials: true,
  })
);

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "kfJKLK87896KHLK",
    store: new FileStore({}),
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("首頁");
});

app.use("/users", usersRouter);
app.use("/try-ab", tryABRouter);
app.use("/api/contacts", apiContactsRouter);

// 測試 zod
app.get("/zod1", (req: Request, res: Response) => {
  const email = req.query.email;
  // 規則
  const emailSchema = z.string().email();
  const result = emailSchema.safeParse(email);
  res.json(result);
});
app.get("/zod2", (req: Request, res: Response) => {
  const email = req.query.email;
  const emailSchema = z.string().email();
  try {
    const result = emailSchema.parse(email);
    res.json(result);
  } catch (ex) {
    res.json(ex);
  }
});
app.get("/zod3", (req: Request, res: Response) => {
  const { email, password } = req.query;

  const loginSchema = z.object({
    email: z
      .string({ message: "請填寫Email" })
      .email({ message: "請輸入正常的電子郵件格式" }),
    password: z
      .string({ message: "請填寫密碼" })
      .min(6, { message: "密碼長度太短" }),
  });

  try {
    const result = loginSchema.parse({ email, password });
    res.json(result);
  } catch (error) {
    let details;
    if (error instanceof z.ZodError) {
      details = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
    }
    res.json({ success: false, errors: details });
  }
});
app.get("/try-sess", (req: Request, res: Response) => {
  (req.session as any).my_num = (req.session as any).my_num || 0;
  (req.session as any).my_num++;
  res.json(req.session);
});

app.post("/try-post", upload.none(), (req: Request, res: Response) => {
  res.json(req.body);
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Express + TS 啟動 http://localhost:${port}`);
});

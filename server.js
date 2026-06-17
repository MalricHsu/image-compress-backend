import express from "express";
import cors from "cors";
import { formidable } from "formidable";
import sharp from "sharp";
import fs from "fs";

const app = express();
const PORT = 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://image-compress-frontend.vercel.app/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.get("/", (req, res) => {
  res.send("伺服器已開始");
});

app.post("/upload", async (req, res) => {
  const form = formidable({
    maxFieldsSize: 8 * 1024 * 1024,
  });

  try {
    const [fields, files] = await form.parse(req); //formidable 暫存的地方

    if (!files.image || files.image.length === 0) {
      return res.status(400).json({ error: "請上傳一張圖片" });
    }

    const uploadedFile = files.image[0]; //對應postman的key設定，取出第一筆
    console.log("收到的欄位:", fields);
    console.log("收到的檔案:", files);

    //檢查檔案
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      //清掉暫存檔
      fs.unlink(uploadedFile.filepath, () => {});
      return res
        .status(400)
        .json({ error: "只支援 JPEG、PNG、WebP 格式的圖片" });
    }

    // 從 fields 拿出使用者設定的值,如果沒傳就用預設值
    const quality = fields.quality ? parseInt(fields.quality[0]) : 70;
    const width = fields.width ? parseInt(fields.width[0]) : 800;

    // 從 mimetype 取出格式(例如 "image/png" -> "png")
    const originalFormat = uploadedFile.mimetype.split("/")[1];

    //因為 sharp 的方法是 .jpeg() 沒有 .jpg()
    const format = fields.format
      ? fields.format[0]
      : originalFormat === "jpg"
        ? "jpeg"
        : originalFormat;

    // 先建立 sharp 處理物件(還沒輸出)
    const sharpInstance = sharp(uploadedFile.filepath).resize({ width: width });
    // 根據 format 動態決定輸出方式
    if (format === "jpeg") {
      sharpInstance = sharpInstance.jpeg({ quality: quality });
    } else if (format === "png") {
      sharpInstance = sharpInstance.png({ quality: quality });
    } else if (format === "webp") {
      sharpInstance = sharpInstance.webp({ quality: quality });
    }

    //壓縮成bytes 處理結果轉成記憶體中的 buffer(二進位資料),而不是存成檔案
    const compressedBuffer = await sharpInstance.toBuffer();

    // 處理完畢,刪除暫存檔案
    fs.unlink(uploadedFile.filepath, (error) => {
      if (error) console.error("刪除暫存檔案失敗", error);
    });
    console.log("原始大小:", uploadedFile.size, "bytes");
    console.log("壓縮後大小:", compressedBuffer.length, "bytes");

    res.set({ "Content-Type": `image/${format}` });
    res.send(compressedBuffer);
  } catch (error) {
    console.error(error);

    //formidable 套件内部固定用來代表「檔案超過大小限制」
    if (error.code === 1009) {
      return res.status(413).json({ error: "檔案太大,請上傳 8MB 以下的圖片" });
    }
    res.status(500).json({ error: "上傳失敗" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

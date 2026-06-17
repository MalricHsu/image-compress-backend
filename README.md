# image-compress-backend

一個輕量的圖片壓縮後端服務，使用 [Express](https://expressjs.com/) 與 [sharp](https://sharp.pixelplumbing.com/) 打造。上傳一張圖片，可指定品質、寬度與輸出格式，伺服器會回傳壓縮後的圖片。

## 功能特色

- 支援 JPEG、PNG、WebP 格式上傳
- 可自訂壓縮品質、輸出寬度與輸出格式
- 限制上傳大小（8MB），並會清除暫存檔
- 內建 CORS 白名單設定

## 技術棧

- Node.js（ES Modules）
- Express 5
- formidable（解析 multipart/form-data）
- sharp（圖片處理與壓縮）
- cors

## 安裝

```bash
npm install
```

## 啟動

```bash
node server.js
```

伺服器預設執行於 `http://localhost:3000`。

## API

### `GET /`

健康檢查，回傳 `伺服器已開始`。

### `POST /upload`

上傳並壓縮圖片。請以 `multipart/form-data` 送出。

**參數**

| 欄位      | 型別   | 必填 | 預設     | 說明                              |
| --------- | ------ | ---- | -------- | --------------------------------- |
| `image`   | File   | 是   | —        | 圖片檔（JPEG / PNG / WebP）       |
| `quality` | Number | 否   | `70`     | 壓縮品質（1–100）                 |
| `width`   | Number | 否   | `800`    | 輸出寬度（px），高度等比例縮放    |
| `format`  | String | 否   | 原始格式 | 輸出格式：`jpeg` / `png` / `webp` |

**回應**

- 成功：回傳壓縮後的圖片二進位資料，`Content-Type` 為對應的 `image/*`。
- 失敗：

  | 狀態碼 | 說明                     |
  | ------ | ------------------------ |
  | `400`  | 未上傳圖片，或格式不支援 |
  | `413`  | 檔案超過 8MB             |
  | `500`  | 伺服器處理失敗           |

**範例（curl）**

```bash
curl -X POST http://localhost:3000/upload \
  -F "image=@./photo.jpg" \
  -F "quality=60" \
  -F "width=1024" \
  -F "format=webp" \
  --output compressed.webp
```

## 授權

ISC

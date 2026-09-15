# 飛螢農莊官方網站

Vite + React + TypeScript + Tailwind v4 靜態網站，部署於 GitHub Pages，附一個純瀏覽器端的內容後台。

- 正式網站：<https://nice923boss.github.io/fireflyfarm/>
- 內容後台：<https://nice923boss.github.io/fireflyfarm/admin/>
- 老闆操作手冊：[docs/老闆後台操作說明.md](docs/老闆後台操作說明.md)
- 已知限制與未完成項目：[GAPS.md](GAPS.md)

## 架構

```
content/            所有網站文字與圖片路徑（8 個 JSON，前端只負責渲染）
  site.json         站名、SEO、共用連結、導覽列、主視覺、頁尾、浮動按鈕
  audiences.json    專屬體驗
  rooms.json        住宿空間（卡片、設備清單、寫真集）
  seasons.json      四季旅行
  activities.json   美味與活動
  transport.json    交通資訊
  faq.json          常見問題（分類與問答，答案為區塊陣列）
  edm.json          EDM 專案視窗
public/images/      老闆上傳的照片（檔名 <時間戳>-<slug>.jpg）與 placeholder.svg
src/content/        zod schema 與內建內容載入
src/site/           前台元件（Header、Hero、各區塊、Modals、Footer、FloatingBar）
src/admin/          後台（Login、AdminApp、各區塊編輯器、儲存計畫、部署狀態、預覽）
src/lib/            GitHub REST 客戶端、圖片壓縮、連結解析、儲存工具
tests/              vitest 單元與元件測試
.github/workflows/deploy.yml   push 到 main 後自動 build 並部署到 Pages
faq/faq.html        原始靜態頁，保留不動，作為內容比對依據
```

前端與後台是同一個 Vite 專案的兩個入口（`index.html` 與 `admin/index.html`），`base` 為 `/fireflyfarm/`。

## 本機開發

```bash
npm install
npm run dev        # http://localhost:5173/fireflyfarm/ 與 /fireflyfarm/admin/
npm test           # vitest（jsdom + React Testing Library）
npm run build      # tsc --noEmit && vite build，輸出 dist/
npm run preview    # 預覽 dist/
```

## 後台如何運作（安全設計）

GitHub Pages 是純靜態主機，沒有伺服器，因此：

- 程式碼裡沒有任何帳號、密碼、密碼雜湊或隱藏網址。後台網址公開，安全性不依賴隱蔽。
- 老闆登入時貼入 GitHub Fine-grained Personal Access Token，權限只授予 `fireflyfarm` 倉庫的 Contents: Read and write。
- Token 只存在該分頁的 `sessionStorage`，關閉分頁即清除，絕不寫入倉庫或任何檔案。
- 所有寫入透過 GitHub REST API 直接 commit 到倉庫：先用 Git Data API 建立 blob 與 tree，一次 commit 同時包含變更的 JSON 與新照片，並移除不再引用的舊照片（`public/images/placeholder.svg` 除外）。
- 圖片上傳前在瀏覽器端壓縮：長邊 1600px、JPEG 品質 0.8，檔名加時間戳避免衝突。
- commit 後 GitHub Actions 自動重新 build 並部署；後台顯示「已送出，約 1 至 2 分鐘後生效」並輪詢最近一次部署狀態（未認證的公開 API，每 15 秒一次，最多 10 分鐘）。
- 尚未發布的文字草稿存在 `localStorage`，重新開啟後台可接續；未發布的照片只存在記憶體。

## 內容資料格式重點

- 連結物件 `{ label, kind, value }`：`kind` 為 `shared`（`site.links` 的代號）、`anchor`（頁面區塊 id）、`edm`（EDM 項目 id）或 `url`（自訂網址）。
- 圖片物件 `{ src, alt }`，`src` 為 `images/xxx.jpg`（倉庫內）或 `https://...`（外部）。前端以 `imageUrl()` 自動加上 `base`。
- FAQ 答案為區塊陣列，型別有 `p`、`box`、`stats`、`items`、`contact`、`buttons`；文字中的 `**粗體**` 會轉成粗體。
- 所有 JSON 在啟動時經 zod 驗證，格式錯誤會直接在 build 或後台載入時報錯。

## 部署步驟（首次）

1. 在 GitHub 建立公開倉庫 `nice923boss/fireflyfarm`。
2. 倉庫 Settings → Pages → Build and deployment → Source 選「GitHub Actions」。
3. 將本專案 push 到 `main` 分支。
4. 到 Actions 分頁等待「Deploy to GitHub Pages」完成（約 1 至 2 分鐘）。
5. 開啟 <https://nice923boss.github.io/fireflyfarm/> 與 `/admin/` 確認。

之後每次後台發布或 push 到 `main` 都會自動重新部署。

## 製作者

黃政文

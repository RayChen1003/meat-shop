# 🥩 御選精肉 - Vercel 部署指南

## 快速部署步驟（10 分鐘上線）

### 方法一：一鍵部署（推薦）

1. **將專案上傳到 GitHub**
   ```bash
   # 初始化 Git
   git init
   git add .
   git commit -m "Initial commit"
   
   # 連接到 GitHub（先在 GitHub 建立新 repo）
   git remote add origin https://github.com/你的帳號/meat-shop.git
   git push -u origin main
   ```

2. **在 Vercel 部署**
   - 前往 [vercel.com](https://vercel.com)
   - 使用 GitHub 帳號登入
   - 點擊 "New Project"
   - 選擇剛剛建立的 repo
   - 點擊 "Deploy" 
   - 等待 2-3 分鐘完成部署！

3. **完成！** 你會得到一個類似 `https://meat-shop-xxx.vercel.app` 的網址

---

### 方法二：使用 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel

# 部署到生產環境
vercel --prod
```

---

## 專案結構

```
meat-shop-vercel/
├── pages/
│   ├── _app.js         # App 入口
│   └── index.js        # 主頁面（所有功能）
├── lib/
│   └── store.js        # 狀態管理
├── styles/
│   └── globals.css     # 全域樣式
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

---

## 功能說明

### 前台
- ✅ 首頁 Hero 橫幅
- ✅ 商品分類瀏覽
- ✅ 商品快速預覽
- ✅ 購物車功能
- ✅ 結帳流程

### 後台 (進入方式：點擊導航列「後台」)
- ✅ 進銷存管理
  - 庫存總覽
  - 低庫存警示
  - 進貨/出貨/盤點
  - 異動紀錄
- ✅ 商品管理
  - 新增/編輯/刪除商品
  - 圖片網址設定
- ✅ 訂單管理
  - 訂單列表

---

## 自訂網域

1. 在 Vercel 專案設定中點擊 "Domains"
2. 輸入你的網域（例如：meatshop.com）
3. 按照指示設定 DNS 記錄
4. 等待 DNS 生效（通常 5-30 分鐘）

---

## 下一步建議

如果需要更完整的電商功能：

1. **資料庫整合** - 連接 MongoDB / PostgreSQL
2. **會員系統** - 使用 NextAuth.js
3. **金流整合** - 串接綠界 ECPay / 藍新
4. **圖片上傳** - 整合 Cloudinary

需要這些進階功能可以再告訴我！

---

## 技術棧

- **框架**: Next.js 14
- **樣式**: Tailwind CSS
- **部署**: Vercel
- **狀態管理**: Custom Store (可替換為 Zustand)

---

Made with ❤️ for 御選精肉

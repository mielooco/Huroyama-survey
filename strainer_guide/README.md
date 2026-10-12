# HUROYAMA 浴山廚房快排濾網使用指南

本資料夾為可直接部署於 GitHub Pages 的靜態網站，入口為 `index.html`。

- 網址： https://survey.mieloo-corp.com/strainer_guide/
- 現行 B 版： `index.html`
- 保留 A 版： `version-a.html`
- `assets/`：影片、模型、字型及品牌素材，請連同子目錄一起保留。
- `vendor/`：Three.js 及相關授權檔案。
- 不需要 npm 安裝或編譯；請透過 HTTP 網站開啟，直接雙擊 HTML 無法完整載入 3D 模型。

## 累計參與與使用人次

GitHub Pages 不提供原網站的 Cloudflare D1 計數 API。此版暫保留原頁面基準值 4739，不呼叫未設定的 API，也不以瀏覽器假造增量。

未來啟用時，在 `index.html` 與 `version-a.html` 的 head 加入 `engagement-endpoint` meta，content 指向已配置的計數服務。服務須接受 POST JSON `{id}`，同一 id 不重複計數，回傳 JSON `{count}`；跨網域服務須允許本站來源。後端需處理資料保存、去重與防濫用，並先確認歷史計數的搬移方式。

## 版本來源

2026-10-12 由互動說明書原始碼版本 `63a638949ce617d5d75b8ebea060047da434245a` 匯入。
包含影片滑入自動播放、半透明步驟按鈕與播放結束中央重播圖示。
此匯入僅新增 `strainer_guide/`，不變更儲存庫根目錄或原問卷與尺寸校驗頁面。

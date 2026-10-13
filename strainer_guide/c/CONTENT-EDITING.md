# C 版內容編輯

本目錄為獨立 C 版。修改本目錄，不修改上一層 B 版。

- `content.js`：首頁文字、兩個入口、五章標題、影片步驟、Q&A 與補充連結。
- `home.actions`：開始安裝、遇到問題。
- `chapters`：保留 id，順序為 install、empty、use、fit、care，編號 01–05。
- `care.resourceLinks`：Q&A 下方的 fit、product、operation。
- `links.fit.url`：尺寸確認網址。
- `links.product.url`：目前為嘖嘖，日後在此換成官網。
- `links.operation.file`、`poster`：站內完整影片與封面。只有點 Q&A 下方「完整影片」才載入。
- `videos`：安裝、清倒與清潔三段教學影片及步驟秒數。

內容檢查：`node scripts/check-content.mjs`。
更新已發布的程式或內容後，需一併更新入口及引用模組的版本參數，以避免快取。

素材與程式在 C 版各自保留，B 版可持續用原網址比較。

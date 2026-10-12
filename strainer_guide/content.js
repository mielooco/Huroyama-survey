// 常用內容編輯入口。請先閱讀 CONTENT-EDITING.md。
// 修改引號內文字，保留逗號、引號與括號。不要把程式碼放進文字。
export const content = {
  // 網站名称、瀏覽器標題、頁尾
  "site": {
    "title": "HUROYAMA 浴山｜廚房快排濾網使用指南",
    "description": "浴山廚房快排濾網使用指南：商品規格、安裝、日常排水止水、清倒與清潔維護。",
    "brand": "HUROYAMA",
    "brandSubtitle": "浴山 · 產品使用指南",
    "footerBrand": "HUROYAMA 浴山",
    "footerText": "廚房快排濾網 · 功能指南",
    "aboutLabel": "關於此版本",
    "aboutUrl": "./model-notes.html"
  },
  // 首頁文案。counterBaseline 是已核實的歷史基準，目前不會自動累加。
  "home": {
    "eyebrow": "HUROYAMA · EVERYDAY GUIDE",
    "title": "從安裝到每日使用。",
    "description": [
      "浴山廚房快排濾網使用指南",
      "往下探索，或直接前往你需要的使用說明。"
    ],
    "tagline": "菜渣看不到 · 臭味聞不到 · 廚餘摸不到",
    "topics": "商品規格 / 操作 / 清潔維護",
    "counterLabel": "累計參與與使用人次：",
    "counterBaseline": 4739,
    "linkOrder": [
      "fit",
      "product",
      "operation"
    ]
  },
  // 常用外部連結；首頁和安裝區的尺寸連結共用這裡。
  "links": {
    "fit": {
      "label": "確認適用尺寸",
      "url": "https://survey.mieloo-corp.com/fit-check/#type"
    },
    "product": {
      "label": "產品介紹",
      "url": "https://www.zeczec.com/projects/huro_strainer"
    },
    "operation": {
      "label": "操作影片",
      "url": "https://www.youtube.com/watch?v=KUTuMWCO0BQ"
    }
  },
  // 五個章節；只修改文字，保留 id、number 與順序。
  "chapters": [
    {
      "id": "fit",
      "navTitle": "規格說明",
      "navDescription": "模型、部件與尺寸",
      "number": "01",
      "title": "規格說明",
      "description": "從尺寸到零件，先認識你的廚房濾網。"
    },
    {
      "id": "install",
      "navTitle": "放入安裝",
      "navDescription": "第一次怎麼裝？",
      "number": "02",
      "title": "取出舊濾籃。放入新日常。",
      "description": "適用尺寸確認後，依序了解安裝位置與使用前檢查。"
    },
    {
      "id": "use",
      "navTitle": "日常使用",
      "navDescription": "排水或止水？",
      "number": "03",
      "title": "一按之間，切換日常。",
      "description": "依你當下的需求，查看產品的兩種使用狀態。"
    },
    {
      "id": "empty",
      "navTitle": "清倒廚餘",
      "navDescription": "怎麼取出渣籃？",
      "number": "04",
      "title": "用提把完成取渣與清倒。",
      "description": "專用提把協助提取渣籃，減少雙手直接接觸廚餘。"
    },
    {
      "id": "care",
      "navTitle": "清潔維護",
      "navDescription": "怎麼洗、怎麼照顧？",
      "number": "05",
      "title": "每次洗淨，為下次準備。",
      "description": "日常沖洗渣籃，需要時再進行深度浸泡清潔。"
    }
  ],
  // 安裝章節按鈕
  "installation": {
    "modelButton": "對照水槽安裝模型"
  },
  // 3D 示意載入前的文字；模型與特效設定仍在互動程式。
  "dailyUse": {
    "placeholder": "滑到這裡，探索蓄水、排水與止臭。"
  },
  // 三段影片：file 是影片路徑，poster 是封面。at 是點步驟停格秒數；start 是播放時切換該步驟的秒數。保留 install/empty/care 與每段三個步驟。
  "videos": {
    "care": {
      "title": "浸泡洗淨",
      "steps": [
        {
          "at": 4.5,
          "start": 0,
          "title": "沖洗渣籃",
          "text": "清倒菜渣後，用專用提把拿取渣籃，沖洗內壁、底部與孔洞。"
        },
        {
          "at": 15,
          "start": 9,
          "title": "放回並浸泡",
          "text": "放回渣籃，以提把按壓中央止水，加入適用的清潔液浸泡。清潔劑擇一使用，濃度與時間依標示。"
        },
        {
          "at": 19.3,
          "start": 17,
          "title": "排水並沖淨",
          "text": "用提把再次按壓中央解除止水，排出清潔液，再用清水充分沖淨。"
        }
      ],
      "file": "./assets/video/care.mp4",
      "poster": "./assets/video/care-poster.jpg"
    },
    "install": {
      "title": "放入安裝",
      "steps": [
        {
          "at": 3.3,
          "start": 0,
          "title": "取出原有濾籃",
          "text": "取出水槽原本的濾籃，保留原排水座與下方管路。"
        },
        {
          "at": 5.7,
          "start": 4.7,
          "title": "放入浴山濾網",
          "text": "對準排水座放入，確認適配環就位、杯體平穩。"
        },
        {
          "at": 12.8,
          "start": 7.4,
          "title": "依序放入零件",
          "text": "依影片順序，將各個零件逐一放入並確認就位。"
        }
      ],
      "file": "./assets/video/install.mp4",
      "poster": "./assets/video/install-poster.jpg"
    },
    "empty": {
      "title": "清倒廚餘",
      "steps": [
        {
          "at": 0.7,
          "start": 0,
          "title": "用提把取下上蓋",
          "text": "先停止進水、排空蓄水，再用專用提把取下上蓋。"
        },
        {
          "at": 2.3,
          "start": 1.5,
          "title": "提起渣籃倒渣",
          "text": "用提把接合中央位置，提起渣籃，把菜渣倒入廚餘桶。"
        },
        {
          "at": 5.5,
          "start": 3.2,
          "title": "放回渣籃與上蓋",
          "text": "清倒後沖洗渣籃與孔洞，再放回渣籃及上蓋。影片示範復位，沖洗步驟請另外完成。"
        }
      ],
      "file": "./assets/video/empty.mp4",
      "poster": "./assets/video/empty-poster.jpg"
    }
  },
  // 清潔文案與 Q&A；可增減 faq 問答，保留 daily/deep。
  "care": {
    "modes": {
      "daily": {
        "label": "日常清洗",
        "title": "每次使用後，清倒與沖洗。",
        "text": "先將廚餘倒入桶內，再沖洗渣籃的內壁、底部與孔洞，並查看上蓋背面和杯體內側是否有殘留。",
        "note": "放回前，確認孔洞暢通、接觸面沒有夾住菜渣。"
      },
      "deep": {
        "label": "深度清潔",
        "title": "需要深度清潔時，浸泡後沖淨。",
        "text": "放回渣籃，以專用提把按壓中央止水，加入適用的清潔液浸泡，再解除止水並用清水充分沖淨。",
        "note": "清潔前確認水槽、零件與清潔劑的適用條件；清潔液擇一使用，用量與時間依標示。黏滑殘留的處理方式可見下方 Q&A。"
      }
    },
    "faqTitle": "遇到這些情況，可以先看這裡",
    "faq": [
      {
        "question": "摸起來黏滑，是生物膜嗎？如何不沾手清潔？",
        "answer": [
          {
            "type": "paragraph",
            "text": "黏滑殘留可能包含油污與生物膜。使用專用提把可完成提取渣籃及按壓止水閥，減少雙手直接接觸菜渣。可依習慣選擇以下方式，仍建議每天清倒廚餘。"
          },
          {
            "type": "paragraph",
            "text": "用專用提把提起渣籃，倒掉菜渣，沖洗內壁、底部與孔洞後放回。規律清潔能減少污垢與生物膜累積，但不能保證完全不生成。",
            "heading": "方式一：每天隨手清（最推薦）",
            "newLine": true
          },
          {
            "type": "paragraph",
            "text": "",
            "heading": "方式二：需要時，浸泡後沖洗",
            "newLine": false
          },
          {
            "type": "list",
            "items": [
              "先清倒菜渣、按壓止水，再放入自來水至排水口附近，淹過要清潔的部位。",
              "確認水槽、零件與清潔劑標示允許後，擇一使用檸檬酸或過碳酸鈉。檸檬酸偏向處理水垢，過碳酸鈉偏向處理有機污漬；兩者的用途不同。浸泡 10～15 分鐘僅在產品標示允許時採用，用量、水溫與時間以標示為準。",
              "用專用提把按壓中央止水閥，解除止水，讓清潔液排出。",
              "用清水充分沖淨。若仍有黏滑殘留，用柔軟刷具或海綿清除，再沖洗；浸泡不保證完全去除生物膜。"
            ]
          },
          {
            "type": "paragraph",
            "text": "檸檬酸與過碳酸鈉不要混用；檸檬酸也不可與含氯漂白水混用。取渣與按壓可用專用提把，清潔時不必直接用手摳除污垢。",
            "heading": "⚠ 請擇一使用：",
            "newLine": false
          }
        ]
      },
      {
        "question": "排水變慢",
        "answer": [
          {
            "type": "paragraph",
            "text": "先清倒渣籃，檢查底部、側邊孔洞及杯體內是否有殘渣，再確認止水閥是否處於排水狀態。若清理後仍無改善，需進一步檢查原有排水系統。"
          }
        ]
      },
      {
        "question": "無法止水，或按壓卡住",
        "answer": [
          {
            "type": "paragraph",
            "text": "查看中央止水部位是否夾有異物、部件是否正確就位。若仍無法正常止水、動作卡滯，或零件有明顯破損，請向米鹿設計團隊詢問對應零件與處理方式。目前沒有已確認的固定更換週期。"
          }
        ]
      },
      {
        "question": "有異味、污垢或疑似霉斑",
        "answer": [
          {
            "type": "paragraph",
            "text": "清潔時一起查看上蓋背面、渣籃內外、杯體內側及適配環接觸處，避免只沖洗看得到的菜渣。這些是清潔檢查位置，目前沒有資料證實特定部件必然容易發霉。持續異味也可能需要檢查原有排水系統。"
          }
        ]
      },
      {
        "question": "哪些是定期更換的耗材？",
        "answer": [
          {
            "type": "paragraph",
            "text": "目前產品資料說明零件可維護與替換，但沒有列出固定耗材週期。請依零件狀況及官方建議處理，不需要自行假設每幾個月整組更換。"
          }
        ]
      }
    ]
  },
};

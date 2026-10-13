import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {content} from '../content.js';
import {escapeHTML,renderFAQ} from '../content-render.js';

const text=(value,name)=>assert.equal(typeof value,'string',`${name} 必須是文字`);
const nonempty=(value,name)=>{text(value,name);assert.ok(value.trim(),`${name} 不可空白`);};
const url=(value,name)=>{nonempty(value,name);assert.ok(/^https:\/\//.test(value)||/^\.\/(?!.*\.\.)/.test(value),`${name} 請用 https:// 網址或 ./ 相對路徑`);};
export async function validateContent(c){
 for(const [key,value] of Object.entries(c.site))nonempty(value,`site.${key}`);
 url(c.site.aboutUrl,'site.aboutUrl');
 for(const key of ['eyebrow','title'])nonempty(c.home[key],`home.${key}`);
 assert.ok(Array.isArray(c.home.description)&&c.home.description.length,'首頁介紹不可空白');
 c.home.description.forEach(v=>text(v,'home.description'));
 for(const [key,link] of Object.entries(c.links)){nonempty(link.label,`links.${key}.label`);url(link.url,`links.${key}.url`);}
 assert.ok(c.links.fit,'不可移除 fit 尺寸連結');
 assert.deepEqual(c.home.actions.map(a=>a.href),['#guide-install','#guide-faq']);
 assert.deepEqual(c.care.resourceLinks,['fit','product','operation']);
 for(const key of c.care.resourceLinks)assert.ok(c.links[key]);
 assert.deepEqual(c.chapters.map(v=>v.id),['install','empty','use','fit','care'],'請保留五章的 id 與顺序');
 c.chapters.forEach((v,i)=>{assert.equal(v.number,String(i+1).padStart(2,'0'),'章節編號不正確');for(const key of ['title','navTitle','navDescription','description'])nonempty(v[key],`chapters.${v.id}.${key}`);});
 nonempty(c.dailyUse.placeholder,'dailyUse.placeholder');
 assert.deepEqual(Object.keys(c.videos).sort(),['care','empty','install'],'請保留三段影片');
 for(const [id,v] of Object.entries(c.videos)){
  nonempty(v.title,`videos.${id}.title`);
  for(const key of ['file','poster']){
   url(v[key],`videos.${id}.${key}`);
   if(v[key].startsWith('./'))await access(new URL('../'+v[key],import.meta.url));
  }
  assert.equal(v.steps.length,3,`${id} 需有三個步驟`);assert.equal(v.steps[0].start,0,`${id} 第一個 start 必須為 0`);
  v.steps.forEach((s,i)=>{
   nonempty(s.title,`${id} 步驟標題`);nonempty(s.text,`${id} 步驟說明`);
   assert.ok(Number.isFinite(s.at)&&Number.isFinite(s.start)&&s.start>=0&&s.at>=s.start,`${id} 步驟秒數不正確`);
   if(i+1<v.steps.length)assert.ok(s.at<v.steps[i+1].start,`${id} 停格秒數不可超出該步驟區間`);
  });
 }
 assert.deepEqual(Object.keys(c.care.modes).sort(),['daily','deep'],'請保留 daily/deep');
 for(const [id,mode] of Object.entries(c.care.modes))for(const key of ['label','title','text','note'])nonempty(mode[key],`care.${id}.${key}`);
 nonempty(c.care.faqTitle,'Q&A 標題');assert.ok(Array.isArray(c.care.faq)&&c.care.faq.length,'Q&A 不可空白');
 for(const item of c.care.faq){
  nonempty(item.question,'Q&A 問題');assert.ok(Array.isArray(item.answer)&&item.answer.length,'Q&A 回答不可空白');
  for(const block of item.answer){
   assert.ok(['paragraph','list'].includes(block.type),'回答區塊只接受 paragraph/list');
   if(block.type==='list'){assert.ok(Array.isArray(block.items)&&block.items.length,'步驟列表不可空白');block.items.forEach(v=>nonempty(v,'回答步驟'));}
   else{text(block.text,'回答文字');if(block.heading!==undefined)nonempty(block.heading,'回答粗體開頭');if(block.newLine!==undefined)assert.equal(typeof block.newLine,'boolean');}
  }
 }
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 await validateContent(content);
 assert.equal(escapeHTML('尺寸 < 12 & "安全"'),'尺寸 &lt; 12 &amp; &quot;安全&quot;');
 const faq=renderFAQ({question:'A < B?',answer:[{type:'paragraph',text:'<script>test</script>'}]});
 assert.ok(!faq.includes('<script>'),'文案必須當作文字處理');
 console.log('PASS：內容格式、章節、連結、影片素材、秒數排序、Q&A 與文字轉義');
}

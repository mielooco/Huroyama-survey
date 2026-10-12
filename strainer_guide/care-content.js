export const biofilmFAQ=`<details><summary>摸起來黏滑，是生物膜嗎？如何不沾手清潔？</summary><p>黏滑殘留可能包含油污與生物膜。使用專用提把可完成提取渣籃及按壓止水閥，減少雙手直接接觸菜渣。可依習慣選擇以下方式，仍建議每天清倒廚餘。</p><p><strong>方式一：每天隨手清（最推薦）</strong><br>用專用提把提起渣籃，倒掉菜渣，沖洗內壁、底部與孔洞後放回。規律清潔能減少污垢與生物膜累積，但不能保證完全不生成。</p><p><strong>方式二：需要時，浸泡後沖洗</strong></p><ol><li>先清倒菜渣、按壓止水，再放入自來水至排水口附近，淹過要清潔的部位。</li><li>確認水槽、零件與清潔劑標示允許後，擇一使用檸檬酸或過碳酸鈉。檸檬酸偏向處理水垢，過碳酸鈉偏向處理有機污漬；兩者的用途不同。浸泡 10～15 分鐘僅在產品標示允許時採用，用量、水溫與時間以標示為準。</li><li>用專用提把按壓中央止水閥，解除止水，讓清潔液排出。</li><li>用清水充分沖淨。若仍有黏滑殘留，用柔軟刷具或海綿清除，再沖洗；浸泡不保證完全去除生物膜。</li></ol><p><strong>⚠ 請擇一使用：</strong>檸檬酸與過碳酸鈉不要混用；檸檬酸也不可與含氯漂白水混用。取渣與按壓可用專用提把，清潔時不必直接用手摳除污垢。</p></details>`;

const careCopy={
 daily:['每次使用後，清倒與沖洗。','先將廚餘倒入桶內，再沖洗渣籃的內壁、底部與孔洞，並查看上蓋背面和杯體內側是否有殘留。','放回前，確認孔洞暢通、接觸面沒有夾住菜渣。'],
 deep:['需要深度清潔時，浸泡後沖淨。','放回渣籃，以專用提把按壓中央止水，加入適用的清潔液浸泡，再解除止水並用清水充分沖淨。','清潔前確認水槽、零件與清潔劑的適用條件；清潔液擇一使用，用量與時間依標示。黏滑殘留的處理方式可見下方 Q&A。']
};
export function careDetails(kind){const copy=careCopy[kind]||careCopy.daily;return `<h3>${copy[0]}</h3><p>${copy[1]}</p><p class="step-note">${copy[2]}</p>`;}
export function syncCare(root,kind){root.querySelectorAll('[data-care]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.care===kind));const copy=root.querySelector('.care-copy');if(copy)copy.innerHTML=careDetails(kind);}

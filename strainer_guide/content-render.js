import {content} from './content.js';

// Treat editable copy as text so quotes, ampersands and angle brackets stay visible.
export function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const esc=escapeHTML;
export function renderFAQ(item){
 const answer=item.answer.map(block=>block.type==='list'
  ?`<ol>${block.items.map(text=>`<li>${esc(text)}</li>`).join('')}</ol>`
  :`<p>${block.heading?`<strong>${esc(block.heading)}</strong>${block.newLine?'<br>':''}`:''}${esc(block.text)}</p>`).join('');
 return `<details><summary>${esc(item.question)}</summary>${answer}</details>`;
}
export function renderPageContent(){
 const {site,home,links}=content;
 document.title=site.title;
 document.querySelector('meta[name="description"]').content=site.description;
 document.querySelector('.site-header').innerHTML=`<a class="brand" href="./" aria-label="浴山首頁"><img class="brand-symbol" src="./assets/huroyama-mark.svg" alt="" width="52" height="28"><span class="brand-mark">${esc(site.brand)}<span>${esc(site.brandSubtitle)}</span></span></a>`;
 document.querySelector('.intro').innerHTML=`<div><p class="eyebrow">${esc(home.eyebrow)}</p><div class="intro-title"><h1>${esc(home.title)}</h1><span class="engagement-badge">${esc(home.counterLabel)}<strong id="engagement-count">${esc(home.counterBaseline)}</strong></span></div><p class="intro-copy">${home.description.map(esc).join('<br>')}</p><div class="intro-links" aria-label="產品相關連結">${home.linkOrder.map(key=>{const link=links[key];return `<a class="fit-questionnaire" href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.label)} ↗</a>`;}).join('')}</div></div><span class="intro-index">${esc(home.tagline)}<span>${esc(home.topics)}</span></span>`;
 document.querySelector('footer').innerHTML=`<span>${esc(site.footerBrand)}</span><span>${esc(site.footerText)}</span><a href="${esc(site.aboutUrl)}">${esc(site.aboutLabel)}</a>`;
}

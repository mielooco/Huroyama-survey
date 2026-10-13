import {content} from './content.js?v=c1';

// Treat editable copy as text so quotes, ampersands and angle brackets stay visible.
export function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const esc=escapeHTML;
export function renderFAQ(item){
 const answer=item.answer.map(block=>block.type==='list'
  ?`<ol>${block.items.map(text=>`<li>${esc(text)}</li>`).join('')}</ol>`
  :`<p>${block.heading?`<strong>${esc(block.heading)}</strong>${block.newLine?'<br>':''}`:''}${esc(block.text)}</p>`).join('');
 return `<details><summary>${esc(item.question)}</summary>${answer}</details>`;
}
const socialIcons={
 website:'<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="16" r="11"/><ellipse cx="16" cy="16" rx="5" ry="11"/><path d="M5 16h22M8 9h16M8 23h16"/></svg>',
 facebook:'<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M19 29V18h4l1-5h-5v-3c0-2 1-3 3-3h2V3h-4c-5 0-7 3-7 7v3H9v5h4v11z"/></svg>',
 line:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M27 14c0 6-6 10-12 11l-4 3 1-5C7 22 4 19 4 14 4 8 9 5 16 5s11 3 11 9z" fill="currentColor"/><text x="16" y="17" text-anchor="middle" fill="#008b49" font-size="8" font-weight="800">LINE</text></svg>',
 instagram:'<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="5" width="22" height="22" rx="7"/><circle cx="16" cy="16" r="5"/><circle cx="23" cy="9" r="1.3" fill="currentColor" stroke="none"/></svg>'
};
export function renderPageContent(){
 const {site,home,links}=content;
 document.title=site.title;
 document.querySelector('meta[name="description"]').content=site.description;
 document.querySelector('.site-header').innerHTML=`<a class="brand" href="./" aria-label="浴山首頁"><img class="brand-symbol" src="./assets/huroyama-mark.svg" alt="" width="52" height="28"><span class="brand-mark">${esc(site.brand)}<span>${esc(site.brandSubtitle)}</span></span></a>`;

 document.querySelector('.intro').innerHTML=`<div><p class="eyebrow">${esc(home.eyebrow)}</p><h1>${esc(home.title)}</h1><p class="intro-copy">${home.description.map(esc).join(' ')}</p><nav class="start-actions" aria-label="開始使用指南">${home.actions.map((a,i)=>`<a class="${i===0?'start-primary':'start-secondary'}" href="${esc(a.href)}" ${a.chapter?`data-go="${esc(a.chapter)}"`:'data-faq-jump'}>${esc(a.label)} <span aria-hidden="true">${i===0?'→':'↘'}</span></a>`).join('')}</nav></div>`;
 document.querySelector('footer').innerHTML=`<nav class="footer-social" aria-label="追蹤米鹿設計">${content.socialLinks.map(link=>`<a class="social-link" href="${esc(link.url)}" target="_blank" rel="noopener"><span class="social-circle social-${esc(link.id)}">${socialIcons[link.id]||'↗'}</span><span class="social-label">${esc(link.label)}</span></a>`).join('')}</nav><div class="footer-meta"><span>${esc(site.footerBrand)}</span><span>${esc(site.footerText)}</span><a href="${esc(site.aboutUrl)}">${esc(site.aboutLabel)}</a></div>`;
}

export function fullFilmMarkup(){const {links}=content;return `<div class="hero-film-stage"><video id="hero-film-player" playsinline muted preload="none" poster="${esc(links.operation.poster)}" data-src="${esc(links.operation.file)}" role="button" tabindex="0" aria-label="播放完整影片" title="點影片播放或暫停"></video><button class="hero-film-start" aria-label="播放完整影片"><span class="hero-film-play" aria-hidden="true">▶</span></button><a class="hero-product-link" href="${esc(links.product.url)}" target="_blank" rel="noopener">${esc(links.product.label)} <span aria-hidden="true">↗</span></a><button class="video-sound hero-film-sound" aria-label="開啟完整影片聲音" aria-pressed="false"></button><span class="hero-film-loading" role="status" hidden>正在載入影片…</span><p class="hero-film-error" role="status" hidden>影片暫時無法載入，<button class="hero-film-retry">重新載入</button></p></div>`;}

import {content} from './content.js?v=hero-film1';

// Treat editable copy as text so quotes, ampersands and angle brackets stay visible.
export function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const esc=escapeHTML;
export function renderFAQ(item){
 const answer=item.answer.map(block=>block.type==='list'
  ?`<ol>${block.items.map(text=>`<li>${esc(text)}</li>`).join('')}</ol>`
  :`<p>${block.heading?`<strong>${esc(block.heading)}</strong>${block.newLine?'<br>':''}`:''}${esc(block.text)}</p>`).join('');
 return `<details><summary>${esc(item.question)}</summary>${answer}</details>`;
}
const clickHand=`<svg class="fit-hand" viewBox="0 0 100 100" aria-hidden="true"><g class="fit-rays" fill="none" stroke="#ffe296" stroke-width="4" stroke-linecap="round"><path d="M35 20V9M19 28l-8-8M53 27l9-9M13 44H3"/></g><path d="M35 62V37c0-11 14-11 14 0v17c2-9 13-8 13 2v3c3-8 13-6 13 3v3c3-7 13-5 13 4v9c0 12-10 19-24 19-10 0-17-4-23-12L23 64c-6-8 4-17 11-10l1 2z" fill="#fffdf6" stroke="#ffe296" stroke-width="4" stroke-linejoin="round"/></svg>`;
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
 document.querySelector('.hero-film').innerHTML=`<div class="hero-film-stage"><div id="hero-film-player"></div><button class="hero-film-start" aria-label="播放完整影片"><img src="${esc(content.videos.install.poster)}" alt="" fetchpriority="high"><span class="hero-film-play" aria-hidden="true">▶</span><span class="hero-film-caption">${esc(links.operation.label)}</span></button><a class="hero-product-link" href="${esc(links.product.url)}" target="_blank" rel="noopener">${esc(links.product.label)} <span aria-hidden="true">↗</span></a><p class="hero-film-error" role="status" hidden>影片暫時無法載入，<a href="${esc(links.operation.url)}" target="_blank" rel="noopener">前往 YouTube 觀看完整影片 ↗</a></p></div>`;
 document.querySelector('.intro').innerHTML=`<div><p class="eyebrow">${esc(home.eyebrow)}</p><div class="intro-title"><h1>${esc(home.title)}</h1><span class="engagement-badge">${esc(home.counterLabel)}<strong id="engagement-count">${esc(home.counterBaseline)}</strong></span></div><p class="intro-copy">${home.description.map(esc).join(' ')}</p><div class="intro-links" aria-label="產品相關連結">${home.linkOrder.map(key=>{const link=links[key];return key==='fit'?`<div class="fit-callout"><p>${esc(home.fitPrompt)}</p><a class="fit-cta" data-intro-link="fit" href="${esc(link.url)}" target="_blank" rel="noopener"><span>${esc(home.fitAction)}</span><span class="fit-arrow" aria-hidden="true">→</span>${clickHand}</a><small>${esc(home.fitNote)}</small></div>`:`<a class="fit-questionnaire" data-intro-link="${esc(key)}" href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.label)} ↗</a>`;}).join('')}</div></div><span class="intro-index">${esc(home.tagline)}<span>${esc(home.topics)}</span></span>`;
 document.querySelector('footer').innerHTML=`<nav class="footer-social" aria-label="追蹤米鹿設計">${content.socialLinks.map(link=>`<a class="social-link" href="${esc(link.url)}" target="_blank" rel="noopener"><span class="social-circle social-${esc(link.id)}">${socialIcons[link.id]||'↗'}</span><span class="social-label">${esc(link.label)}</span></a>`).join('')}</nav><div class="footer-meta"><span>${esc(site.footerBrand)}</span><span>${esc(site.footerText)}</span><a href="${esc(site.aboutUrl)}">${esc(site.aboutLabel)}</a></div>`;
}

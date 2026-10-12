import {content} from './content.js?v=media-start1';
import {escapeHTML as esc,renderFAQ} from './content-render.js?v=media-start1';
export const biofilmFAQ=renderFAQ(content.care.faq[0]);
export function careDetails(kind){const c=content.care.modes[kind]||content.care.modes.daily;return `<h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><p class="step-note">${esc(c.note)}</p>`;}
export function syncCare(root,kind){root.querySelectorAll('[data-care]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.care===kind));const copy=root.querySelector('.care-copy');if(copy)copy.innerHTML=careDetails(kind);}

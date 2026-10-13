import {content} from './content.js?v=c1';
const label = document.querySelector('#engagement-count');
// GitHub Pages serves static files. Set a counter endpoint only after a
// compatible service is configured; never generate browser-only counts.
const endpoint = document.querySelector('meta[name="engagement-endpoint"]')?.content;
let entryId;

async function countEntry() {
  // A new document load or a return from the browser's back-forward cache is
  // one entry. In-page guide tabs do not call this function.
  entryId = crypto.randomUUID();
  const id = entryId;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id}), cache: 'no-store',
      });
      if (!response.ok) throw new Error('Counter unavailable');
      const {count} = await response.json();
      if (entryId === id && Number.isSafeInteger(count) && count >= content.home.counterBaseline) {
        label.textContent = String(count);
      }
      return;
    } catch {
      // Keep the verified historical baseline if the service is unavailable.
      // Never invent an increment in browser storage.
      if (!attempt) await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
}
if (label && endpoint) {
  countEntry();
  window.addEventListener('pageshow', event => { if (event.persisted) countEntry(); });
}

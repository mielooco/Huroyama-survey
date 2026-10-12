import {content} from './content.js?v=fit-social1';
export const chapters=content.chapters.map(c=>[c.id,c.navTitle,c.navDescription]);
export function assessFit(raw){if(String(raw).trim()===''||!Number.isFinite(Number(raw))||Number(raw)<=0)return 'invalid';return Number(raw)>=11&&Number(raw)<=11.5?'within':'outside';}
export function routeFromHash(hash){const value=hash.replace('#guide-','');return chapters.some(c=>c[0]===value)?value:'fit';}

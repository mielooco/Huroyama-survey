export const chapters=[['fit','規格說明','模型、部件與尺寸'],['install','放入安裝','第一次怎麼裝？'],['use','日常使用','排水或止水？'],['empty','清倒廚餘','怎麼取出渣籃？'],['care','清潔維護','怎麼洗、怎麼照顧？']];
export function assessFit(raw){if(String(raw).trim()===''||!Number.isFinite(Number(raw))||Number(raw)<=0)return 'invalid';return Number(raw)>=11&&Number(raw)<=11.5?'within':'outside';}
export function routeFromHash(hash){const value=hash.replace('#guide-','');return chapters.some(c=>c[0]===value)?value:'fit';}

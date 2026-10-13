import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {modelProgress} from '../loading-progress.js';
for(const name of ['filter','sink','handle']){
 const {size}=await stat(new URL(`../assets/${name}.glb`,import.meta.url));
 assert.equal(modelProgress(name,size/2),'正在下載模型 50%');
 assert.match(modelProgress(name,size),/正在準備/);
 assert.match(modelProgress(name,size*2),/正在準備/);
 assert.equal(modelProgress(name,NaN),'正在下載模型…');
 assert.ok(!modelProgress(name,size-1).includes('100%'));
}
console.log('PASS: decoded byte counts, compressed-size mismatch, invalid counts and preparing stage');

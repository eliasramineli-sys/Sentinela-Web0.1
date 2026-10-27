import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedRequest } from '../apps/extension/src/protocol';
const id='test-runtime'; const url=`chrome-extension://${id}/popup.html`;
const sender={ id, url };
test('Aceita apenas a mensagem do popup da própria extensão',()=>assert.equal(isAllowedRequest({type:'ANALYZE_ACTIVE_TAB'},sender,id,url),true));
for(const m of [null,{},[], 'ANALYZE_ACTIVE_TAB',{type:'FETCH_URL',url:'http://127.0.0.1'},{type:'ANALYZE_ACTIVE_TAB',url:'https://gov.br'},{type:'ANALYZE_ACTIVE_TAB',extra:true}]) test(`Rejeita mensagem fora do esquema: ${JSON.stringify(m)}`,()=>assert.equal(isAllowedRequest(m,sender,id,url),false));
for(const other of [{id:'other',url},{id,url:'https://example.com'},{id,url:`chrome-extension://${id}/options.html`},{id,url:`chrome-extension://${id}/popup.html#fake`},{}]) test(`Rejeita remetente fora do popup: ${JSON.stringify(other)}`,()=>assert.equal(isAllowedRequest({type:'ANALYZE_ACTIVE_TAB'},other,id,url),false));

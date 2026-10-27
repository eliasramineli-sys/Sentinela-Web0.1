import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeUrl } from '../packages/detection-engine';
import { editDistance, isWithinDomain } from '../packages/detection-engine/brands';
const fixtures = JSON.parse(readFileSync('tests/fixtures/urls.json', 'utf8')) as { name: string; url: string; status: string; code?: string; official?: string | null; domain?: string | null }[];
for (const f of fixtures) test(f.name, () => {
  const result = analyzeUrl(f.url);
  assert.equal(result.status, f.status);
  if (f.code) assert.ok(result.indicators.some(i => i.code === f.code), `Indicador ausente: ${f.code}`);
  if ('official' in f) assert.equal(result.officialBrand, f.official);
  if ('domain' in f) assert.equal(result.registrableDomain, f.domain);
});
for (const invalid of [null, undefined, 10, {}, [], '', '  ', 'https://', 'javascript:alert(1)', 'data:text/html,hello', 'file:///c:/a.html', 'chrome://extensions', 'edge://settings', 'about:blank', 'ftp://example.com', 'https://a..com', 'https://-a.com', 'https://a-.com', 'https://exa_mple.com', 'https://a.com/has space', 'https://a.com\\@gov.br', 'https://go\u200bv.br', 'https://a.com/\nfoo', 'https://a.com/\u202Eabc', 'x'.repeat(8193)]) {
  test(`Entrada inválida: ${JSON.stringify(invalid)?.slice(0, 55)}`, () => {
    const result = analyzeUrl(invalid); assert.equal(result.status, 'attention'); assert.equal(result.supported, false); assert.equal(result.hostname, null); assert.equal(result.checks.length, 0);
  });
}
test('Não devolve segredos de userinfo, caminho, query ou fragmento', () => {
  const result = JSON.stringify(analyzeUrl('https://userPRIVATE:passSECRET@gov.br/pathSECRET?token=querySECRET#fragmentSECRET'));
  for (const secret of ['userPRIVATE', 'passSECRET', 'pathSECRET', 'querySECRET', 'fragmentSECRET']) assert.ok(!result.includes(secret));
});
test('Query e fragmento não mudam regras por nome de marca', () => {
  const r = analyzeUrl('https://example.com/?brand=gov.br&login=paypal#gov-br'); assert.equal(r.status, 'low'); assert.deepEqual(r.relatedBrands, []);
});
test('Caminho com marca isolada não implica imitação', () => assert.equal(analyzeUrl('https://example.com/noticias/gov-br/desenrola').status, 'low'));
test('Hostname é sempre ASCII e canônico na saída principal', () => {
  const r = analyzeUrl('HTTPS://BÜCHER.DE.:443/a'); assert.equal(r.hostname, 'xn--bcher-kva.de'); assert.equal(r.unicodeHostname, 'bücher.de'); assert.equal(r.status, 'low');
});
test('PSL inclui plataformas multi-inquilino privadas', () => {
  const r = analyzeUrl('https://gov-br.github.io/login'); assert.equal(r.registrableDomain, 'gov-br.github.io'); assert.equal(r.privateSuffix, true); assert.equal(r.officialBrand, null); assert.equal(r.status, 'high');
});
test('Sufixo público gov.br não inventa eTLD+1', () => { const r = analyzeUrl('https://gov.br'); assert.equal(r.registrableDomain, null); assert.equal(r.publicSuffix, 'gov.br'); assert.equal(r.status, 'low'); });
test('Regras são determinísticas exceto horário', () => { const a=analyzeUrl('https://paypal.com.conta.example'); const b=analyzeUrl('https://paypal.com.conta.example'); a.analyzedAt=b.analyzedAt; assert.deepEqual(a,b); });
test('Não expõe pontuação ou categoria de ameaça conhecida', () => { const r=analyzeUrl('https://www.gov.br.conta.example'); assert.ok(!('score' in r)); assert.ok(!('probability' in r)); assert.equal(r.status,'high'); });
test('Entrada máxima e host longo falham sem exceção', () => { assert.doesNotThrow(()=>analyzeUrl('https://a.com/'+ 'x'.repeat(8178))); assert.equal(analyzeUrl('https://'+'a'.repeat(64)+'.com').supported,false); });
test('Nome desconhecido não implica malícia', () => assert.equal(analyzeUrl('https://never-seen-business.com').status, 'low'));
test('Correspondência oficial respeita fronteira de rótulo', () => { assert.ok(isWithinDomain('sso.acesso.gov.br','gov.br')); assert.ok(!isWithinDomain('fakegov.br','gov.br')); assert.ok(!isWithinDomain('gov.br.fake.example','gov.br')); });
test('Distância de edição cobre inserção, remoção e substituição', () => { assert.equal(editDistance('paypal','paypal'),0); assert.equal(editDistance('paypol','paypal'),1); assert.equal(editDistance('paypall','paypal'),1); assert.equal(editDistance('paypl','paypal'),1); });
test('Fuzz determinístico: entradas hostis não lançam nem refletem HTML', () => {
  let seed=71;
  for(let i=0;i<500;i++){
    let s=''; for(let j=0;j<70;j++){ seed=(Math.imul(seed,1664525)+1013904223)>>>0; s+=String.fromCharCode(seed%256); }
    const r=analyzeUrl(s); assert.ok(['low','attention','high'].includes(r.status));
    assert.ok(!JSON.stringify(r).includes('<script>'));
  }
});

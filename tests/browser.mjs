// Harness de interface: APIs chrome.* simuladas; worker e motor reais do build.
// NÃO substitui a instalação nativa da extensão no Chrome/Edge.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve('extensao-pronta');
const manifest = JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
const state = { url: 'https://www.gov.br/pt-br', fail: false, delay: 0, storage: {} };
let listener;
const runtimeId = 'sentinela-test';
const fakeChrome = {
  runtime: { id: runtimeId, getURL: p=>`chrome-extension://${runtimeId}/${p}`, onMessage: { addListener: fn=>{listener=fn;} } },
  tabs: { query: async ()=> { if(state.delay) await new Promise(r=>setTimeout(r,state.delay)); if(state.fail) throw new Error('unavailable'); return [{url:state.url}]; } }
};
vm.runInNewContext(await readFile(path.join(root,'background.js'),'utf8'),{chrome:fakeChrome,URL,console});
assert.equal(typeof listener,'function');
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    const name=url.pathname==='/'?'popup.html':decodeURIComponent(url.pathname.slice(1));
    const full=path.resolve(root,name);
    if(!full.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const mime=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':'text/html';
    res.writeHead(200,{'Content-Type':mime,'Content-Security-Policy':manifest.content_security_policy.extension_pages});
    res.end(await readFile(full));
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const profile=await mkdtemp(path.join(tmpdir(),'sentinela-ui-'));
let browser;let count=0; const errors=[]; const externalRequests=[];
const check=(name)=>{count++;console.log(`OK ${count}: ${name}`);};
try{
  browser=await chromium.launch({headless:true,...(process.env.SENTINELA_CHROMIUM_PATH?{executablePath:process.env.SENTINELA_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:420,height:850},colorScheme:'dark'});
  context.on('request',r=>{if(!r.url().startsWith(base))externalRequests.push(r.url());});
  context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  await context.exposeBinding('__workerMessage',async(_,message)=>new Promise((resolve,reject)=>{
    const keep=listener(message,{id:runtimeId,url:`chrome-extension://${runtimeId}/popup.html`},resolve);
    if(!keep)reject(new Error('Rejected message'));
  }));
  await context.exposeBinding('__storageGet',()=>({...state.storage}));
  await context.exposeBinding('__storageSet',(_,data)=>{Object.assign(state.storage,data);});
  await context.exposeBinding('__storageClear',()=>{state.storage={};});
  await context.addInitScript(()=>{
    window.chrome={
      runtime:{sendMessage:m=>window.__workerMessage(m)},
      storage:{local:{get:()=>window.__storageGet(),set:v=>window.__storageSet(v),clear:()=>window.__storageClear()}}
    };
  });
  const page=await context.newPage();
  const contrast=()=>page.locator('.primary-button').evaluate(button=>{
    const css=getComputedStyle(button);
    const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;};
    const [low,high]=[luminance(css.color),luminance(css.backgroundColor)].sort((a,b)=>a-b);return (high+0.05)/(low+0.05);
  });
  const waitText=async(selector,value)=>{await page.waitForFunction(({selector,value})=>document.querySelector(selector)?.textContent===value,{selector,value});};
  const submit=async(url)=>{await page.locator('#url-input').fill(url);await page.getByRole('button',{name:'Analisar',exact:true}).click();};
  await page.goto(base+'/popup.html');await waitText('#status','Baixo risco identificado');
  assert.equal(await page.locator('#hostname').textContent(),'www.gov.br');check('Fluxo aba → worker → motor → popup (APIs simuladas)');
  await submit('https://www.gov.br.conta.example/login?token=PRIVATE_TOKEN#SECRET');await waitText('#status','Alto risco');
  assert.equal(await page.locator('#hostname').textContent(),'www.gov.br.conta.example');
  assert.match(await page.locator('#domain').textContent(),/conta\.example/);check('Imitação Gov.br destaca o servidor real');
  assert.equal(await page.locator('#warning-panel').isVisible(),true);
  assert.equal(await page.locator('#official-links a').getAttribute('href'),'https://www.gov.br/');check('Alerta com endereço oficial definido no catálogo');
  assert.equal(await page.locator('#url-input').inputValue(),'');
  assert.ok(!(await page.locator('body').textContent()).includes('PRIVATE_TOKEN'));assert.deepEqual(state.storage,{});check('Não persiste URL e remove tokens do resultado/campo');
  await page.locator('#details summary').click();assert.equal(await page.locator('#checks li').count(),4);check('Detalhes mostram verificações e limitações');
  await page.locator('#details summary').click();
  assert.ok(await contrast()>=4.5,'Contraste insuficiente no tema escuro');
  await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/popup-high-dark.png',fullPage:true});
  await page.locator('#theme').click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
  await page.screenshot({path:'artifacts/popup-high-light.png',fullPage:true});check('Tema claro é aplicável e salvo');
  assert.ok(await contrast()>=4.5,'Contraste insuficiente no tema claro');check('Botão principal tem contraste mínimo 4,5:1 nos dois temas');
  await submit('javascript:alert(1)');await waitText('#status','Análise indisponível');
  assert.equal(await page.locator('#warning-panel').isVisible(),false);check('Entrada inválida não recebe baixo risco');
  await page.locator('#refresh').click();await waitText('#status','Baixo risco identificado');await waitText('#source','ABA ATIVA');check('Reanálise restaura a origem da aba');
  await page.reload();await waitText('#status','Baixo risco identificado');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');check('Preferência de tema sobrevive à reabertura');
  state.url=undefined;await page.locator('#refresh').click();await page.locator('#error').waitFor({state:'visible'});await waitText('#status','Análise indisponível');
  await submit('https://www.paypal.com/');await waitText('#status','Baixo risco identificado');check('Aba sem acesso mantém análise manual funcional');
  state.fail=true;await page.locator('#refresh').click();await waitText('#status','Análise indisponível');check('Falha de API não mantém resultado anterior como válido');
  state.fail=false;state.url='https://www.gov.br/';state.delay=400;
  await page.locator('#refresh').click();await submit('https://paypal-seguranca.example/entrar');await waitText('#status','Alto risco');
  await page.waitForTimeout(500);assert.equal(await page.locator('#hostname').textContent(),'paypal-seguranca.example');state.delay=0;check('Resposta antiga da aba não sobrescreve análise manual');
  await submit('https://раypal.example/login');await waitText('#status','Alto risco');
  assert.ok((await page.locator('#hostname').textContent()).includes('xn--'));check('Homógrafo mantém ASCII como servidor principal');
  await page.setViewportSize({width:360,height:800});await submit('https://a.b.c.d.e.f.example.com/');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);check('Layout não transborda a 360 px');
  await page.goto(base+'/options.html');await page.getByRole('button',{name:'Excluir preferências locais'}).click();
  await page.getByText('Preferências locais excluídas.').waitFor();assert.deepEqual(state.storage,{});check('Exclusão de preferências funciona');
  await page.goto(base+'/help.html');await page.getByRole('heading',{name:'Como usar'}).waitFor();
  assert.ok((await page.locator('body').textContent()).includes('Indisponível na 0.1'));check('Orientações distinguem módulos planejados');
  assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[]);check('Sem erro JS ou requisição externa nos fluxos exercitados');
  const report={date:new Date().toISOString(),browserVersion:browser.version(),checks:count,errors,externalRequests,mode:'UI harness com APIs Chrome simuladas; motor e worker reais. Não valida carregamento nativo da extensão.'};
  await writeFile('artifacts/browser-results.json',JSON.stringify(report,null,2)+'\n');
  console.log(`PASS: ${count} verificações de interface. ${report.mode}`);
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true});}

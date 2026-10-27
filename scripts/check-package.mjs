import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const root = 'extensao-pronta';
const manifest = JSON.parse(await readFile(`${root}/manifest.json`, 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
assert.equal(manifest.version, pkg.version);
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ['activeTab', 'storage']);
for (const key of ['host_permissions', 'content_scripts', 'externally_connectable', 'web_accessible_resources', 'optional_host_permissions']) assert.equal(manifest[key], undefined);
assert.ok(manifest.content_security_policy.extension_pages.includes("connect-src 'none'"));
for (const resource of [manifest.action.default_popup, manifest.background.service_worker, manifest.options_ui.page, ...Object.values(manifest.icons)]) assert.ok((await stat(path.join(root, resource))).size > 0);
for (const html of ['popup.html', 'options.html', 'help.html']) {
  const source = await readFile(path.join(root, html), 'utf8');
  assert.ok(!/\son\w+\s*=/i.test(source), 'Inline handler encontrado');
  assert.ok(!/<script(?![^>]*src=)[^>]*>/i.test(source), 'Inline script encontrado');
  for (const [, link] of source.matchAll(/(?:src|href)="([^"]+)"/g)) if (!link.includes('://')) await stat(path.join(root, link));
}
for (const file of await readdir(root)) {
  if (!file.endsWith('.js')) continue;
  const source = await readFile(path.join(root, file), 'utf8');
  assert.ok(!/\beval\s*\(|new\s+Function\s*\(|\.innerHTML\s*=|\bfetch\s*\(|XMLHttpRequest|sendBeacon|new\s+WebSocket/.test(source), 'Operação proibida no pacote: ' + file);
}
console.log('Pacote MV3 verificado: recursos presentes, permissões mínimas, sem código remoto ou API de rede.');

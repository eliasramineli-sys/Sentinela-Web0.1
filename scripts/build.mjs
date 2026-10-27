import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'extensao-pronta');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, 'apps/extension/public'), out, { recursive: true });
await build({ absWorkingDir: root, entryPoints: ['apps/extension/src/popup.ts', 'apps/extension/src/options.ts', 'apps/extension/src/background.ts'], outdir: out, bundle: true, format: 'esm', platform: 'browser', target: 'chrome120', sourcemap: false, minify: false, legalComments: 'eof' });
// Licenças integrais dos pacotes distribuídos, além dos avisos preservados no bundle.
let notices = 'SENTINELA WEB 0.1 — DEPENDÊNCIAS DISTRIBUÍDAS\n\n';
for (const name of ['tldts', 'tldts-core', 'punycode']) {
  notices += `\n===== ${name} =====\n` + await readFile(path.join(root, 'node_modules', name, name === 'punycode' ? 'LICENSE-MIT.txt' : 'LICENSE'), 'utf8');
}
await writeFile(path.join(out, 'THIRD_PARTY_NOTICES.txt'), notices);
console.log('Build concluído: extensao-pronta/ (carregue esta pasta no navegador).');

import { spawnSync } from 'node:child_process';
const python = process.platform === 'win32' ? 'py' : 'python3';
const result = spawnSync(python, [...(process.platform === 'win32' ? ['-3'] : []), 'scripts/package.py'], { stdio: 'inherit' });
if(result.error)console.error('Para gerar o ZIP, instale Python 3. O build da extensão precisa somente de Node.js.');
process.exitCode = result.status ?? 1;

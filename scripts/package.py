"""Empacota fonte e build, sem caches, histórico Git ou evidências internas."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'package.json').read_text())['version']
output = root / 'release' / f'Sentinela-Web-{version}.zip'
output.parent.mkdir(exist_ok=True)
excluded = {'node_modules', '.git', '.test-build', 'artifacts', 'release', '__pycache__'}
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        relative = file.relative_to(root)
        if file.is_file() and not set(relative.parts) & excluded:
            if file.name.startswith('.env') or file.suffix == '.log':
                continue
            archive.write(file, Path('sentinela-web') / relative)
    assert archive.testzip() is None
digest = hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.zip.sha256').write_text(f'{digest}  {output.name}\n')
print(f'{output.name}: {output.stat().st_size:,} bytes; SHA-256 {digest}')

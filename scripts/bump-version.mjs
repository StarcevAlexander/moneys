// Повышает patch-версию в package.json и пересинхронизирует version.ts.
// Вызывается git pre-commit хуком при каждом коммите.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));

const [major, minor, patch] = String(pkg.version)
  .split('.')
  .map((n) => parseInt(n, 10) || 0);
pkg.version = `${major}.${minor}.${patch + 1}`;

await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('Версия повышена ->', pkg.version);

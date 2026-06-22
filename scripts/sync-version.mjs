// Синхронизирует версию из package.json в src/app/core/version.ts.
// Запускается pre-commit хуком и перед сборкой (prebuild).
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const buildTime = new Date().toISOString();

const content = `// Этот файл генерируется автоматически (scripts/sync-version.mjs). Не редактировать вручную.
export const APP_VERSION = '${pkg.version}';
export const BUILD_TIME = '${buildTime}';
`;

await writeFile(join(root, 'src', 'app', 'core', 'version.ts'), content, 'utf8');
console.log('version.ts:', pkg.version, buildTime);

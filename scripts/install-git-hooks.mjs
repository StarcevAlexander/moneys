// Подключает .githooks как директорию git-хуков (запускается на npm install).
import { execSync } from 'node:child_process';

try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
  console.log('Git-хуки подключены: .githooks (авто-бамп версии при коммите)');
} catch {
  // Не git-репозиторий или git недоступен — тихо пропускаем.
}

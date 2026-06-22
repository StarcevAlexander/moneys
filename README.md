# Moneys — PWA

Денежный PWA-кабинет на Angular 21 (zoneless) + Angular Material + Bootstrap.

## Возможности

- **PWA** с service worker: установка на устройство, оффлайн-кэш.
- **Авто-обновление**: проверка новой версии при каждом запуске и раз в сутки; при появлении новой версии приложение обновляется само и перезагружается под лоадером.
- **Заставка** с лоадером-монетой на старте, пока идёт проверка обновлений.
- **Кнопка «Установить»**: показывается, только если приложение ещё не установлено. На iOS — инструкция «Поделиться → На экран Домой».
- **Моковая авторизация**: логин `123`, пароль `123`. Есть разлогин.
- **Пуш-уведомление** «Поступил новый заказ» приходит через 10 секунд после входа.
- **Иконка-монета** с буквой «M» — maskable (Android) + apple-touch (iOS).
- **Адаптив** под все экраны, современный «денежный» стиль.
- **Авто-версионирование**: git pre-commit хук повышает версию при каждом коммите, чтобы PWA видела изменения.

## Запуск

```bash
npm install          # подключит git-хуки (prepare) и поставит зависимости
npm start            # dev-сервер http://localhost:4200
npm run build        # production-сборка в dist/moneys/browser
npm run icons        # перегенерировать иконки-монеты
```

> Service worker и авто-обновление работают только в **production**-сборке, не в `ng serve`.
> Локально проверить PWA: `npm run build` и отдать `dist/moneys/browser` любым статик-сервером по HTTPS/localhost.

## Версионирование

- `scripts/bump-version.mjs` — повышает patch-версию в `package.json`.
- `scripts/sync-version.mjs` — пишет версию в `src/app/core/version.ts` (используется в UI и при сборке через `prebuild`).
- `.githooks/pre-commit` — на каждом коммите бампит версию и добавляет изменения в коммит.
- Хуки подключаются автоматически на `npm install` (скрипт `prepare`). Вручную: `git config core.hooksPath .githooks`.

## Деплой на GitHub Pages

Workflow `.github/workflows/deploy.yml` собирает и публикует приложение на GitHub Pages **при каждом пуше в `master`** (base-href подставляется по имени репозитория).

Первичная настройка (выполняется разработчиком):

```bash
# 1. Создать репозиторий на GitHub
gh repo create moneys --public --source=. --remote=origin

# 2. Запушить master
git add -A
git commit -m "feat: PWA Moneys"
git push -u origin master

# 3. Settings → Pages → Build and deployment → Source: GitHub Actions
```

После этого приложение будет доступно по адресу `https://StarcevAlexander.github.io/moneys/`.

import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UPDATE_CHECK_INTERVAL_MS } from '../constants';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);

  /** true пока идёт активация обновления и перезагрузка — показываем лоадер. */
  readonly updating = signal(false);

  /** Запускается один раз при старте приложения. */
  init(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Раз в сутки проверяем наличие новой версии.
    setInterval(() => {
      void this.checkForUpdate();
    }, UPDATE_CHECK_INTERVAL_MS);

    // Как только новая версия готова — обновляемся автоматически.
    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        void this.applyUpdate();
      }
    });

    // Кэш сломался и восстановиться нельзя — жёстко перезагружаемся.
    this.swUpdate.unrecoverable.subscribe(() => this.reload());
  }

  /** Проверка обновления (на старте и по таймеру). Возвращает true, если версия найдена. */
  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }
    try {
      return await this.swUpdate.checkForUpdate();
    } catch {
      return false;
    }
  }

  /** Активирует загруженную версию и перезагружает страницу под лоадером. */
  async applyUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      return;
    }
    this.updating.set(true);
    try {
      await this.swUpdate.activateUpdate();
      this.reload();
    } catch {
      this.updating.set(false);
    }
  }

  private reload(): void {
    this.document.location.reload();
  }
}

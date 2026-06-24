import {
  ApplicationConfig,
  inject,
  isDevMode,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { PwaInstallService, ThemeService } from './core/services';

registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes, withComponentInputBinding()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    // Поднимаем сервис установки до старта UI, чтобы перехватить beforeinstallprompt с первой секунды.
    // ThemeService — чтобы сохранённая тема применилась сразу, а не при открытии настроек.
    provideAppInitializer(() => {
      inject(PwaInstallService);
      inject(ThemeService);
    }),
  ],
};

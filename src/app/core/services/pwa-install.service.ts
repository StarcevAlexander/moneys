import { Injectable, computed, signal } from '@angular/core';
import { BeforeInstallPromptEvent } from '../models';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private readonly deferredPrompt = signal<BeforeInstallPromptEvent | undefined>(undefined);

  /** Приложение уже установлено (запущено в standalone-режиме). */
  readonly installed = signal(this.detectInstalled());

  /** iOS Safari: программной установки нет, показываем инструкцию. */
  readonly isIos = this.detectIos();

  /** Показывать ли кнопку «Установить». */
  readonly canInstall = computed(
    () => !this.installed() && (!!this.deferredPrompt() || this.isIos),
  );

  /** Для iOS — нужно показать подсказку вместо системного диалога. */
  readonly needsIosHint = computed(() => !this.installed() && this.isIos && !this.deferredPrompt());

  constructor() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt.set(event as BeforeInstallPromptEvent);
    });

    window.addEventListener('appinstalled', () => {
      this.installed.set(true);
      this.deferredPrompt.set(undefined);
    });

    window
      .matchMedia('(display-mode: standalone)')
      .addEventListener('change', (e) => this.installed.set(e.matches));
  }

  /** Возвращает true, если установка реально запустилась/завершилась. */
  async promptInstall(): Promise<boolean> {
    const event = this.deferredPrompt();
    if (!event) {
      return false;
    }
    await event.prompt();
    const choice = await event.userChoice;
    this.deferredPrompt.set(undefined);
    if (choice.outcome === 'accepted') {
      this.installed.set(true);
      return true;
    }
    return false;
  }

  private detectInstalled(): boolean {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
    return standalone || iosStandalone;
  }

  private detectIos(): boolean {
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isIpadOs = ua.includes('macintosh') && 'ontouchend' in document;
    return isIosDevice || isIpadOs;
  }
}

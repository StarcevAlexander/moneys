import { Injectable } from '@angular/core';
import {
  ORDER_NOTIFICATION_BODY,
  ORDER_NOTIFICATION_DELAY_MS,
  ORDER_NOTIFICATION_TITLE,
} from '../constants';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private orderTimer?: ReturnType<typeof setTimeout>;

  get supported(): boolean {
    return 'Notification' in window;
  }

  get permission(): NotificationPermission {
    return this.supported ? Notification.permission : 'denied';
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.supported) {
      return 'denied';
    }
    if (Notification.permission === 'default') {
      return Notification.requestPermission();
    }
    return Notification.permission;
  }

  /** После авторизации запрашиваем разрешение и через 10 секунд шлём пуш о заказе. */
  async scheduleOrderNotification(): Promise<void> {
    await this.requestPermission();
    clearTimeout(this.orderTimer);
    this.orderTimer = setTimeout(() => {
      void this.notify(ORDER_NOTIFICATION_TITLE, ORDER_NOTIFICATION_BODY);
    }, ORDER_NOTIFICATION_DELAY_MS);
  }

  cancelOrderNotification(): void {
    clearTimeout(this.orderTimer);
  }

  async notify(title: string, body: string): Promise<void> {
    if (this.permission !== 'granted') {
      return;
    }
    const options: NotificationOptions = {
      body,
      icon: 'icons/icon-192x192.png',
      badge: 'icons/icon-96x96.png',
      tag: 'moneys-order',
    };

    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { RESPONSE_CONFIRM_DELAY_MS } from '../../core/constants';
import { NotificationService } from '../../core/services';
import { JobPoint } from '../jobs/jobs.models';
import { ORDER_STATUS_TITLE, statusNotificationBody } from './applications.constants';
import { APPLICATIONS } from './applications.data';
import { JobApplication, OrderStatusNotification } from './applications.models';

/** Общее реактивное состояние заявок: моки + отклики пользователя. */
@Injectable({ providedIn: 'root' })
export class ApplicationsStore {
  private readonly notifications = inject(NotificationService);
  private readonly _items = signal<JobApplication[]>([...APPLICATIONS]);

  // Таймеры отложенных пушей-подтверждений по id заявки — чтобы отменить при отзыве.
  private readonly confirmTimers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly items = this._items.asReadonly();

  hasResponded(jobId: string): boolean {
    return this._items().some((a) => a.id === this.responseId(jobId));
  }

  /** Отклик на вакансию: заявка «ожидает подтверждения» + пуш с подтверждением через 10 секунд. */
  respond(job: JobPoint): void {
    if (this.hasResponded(job.id)) {
      return;
    }

    const application: JobApplication = {
      id: this.responseId(job.id),
      title: job.title,
      company: job.company,
      date: 'Сегодня',
      isoDate: '2026-06-23',
      payout: job.payout,
      status: 'awaiting',
      description: job.description,
    };
    this._items.update((list) => [application, ...list]);

    void this.notifications.requestPermission();
    const timer = setTimeout(
      () => this.applyStatusNotification({ id: application.id, status: 'assigned' }),
      RESPONSE_CONFIRM_DELAY_MS,
    );
    this.confirmTimers.set(application.id, timer);
  }

  /** Отзыв заявки: убираем из списка и отменяем отложенный пуш-подтверждение. */
  withdraw(id: string): void {
    const timer = this.confirmTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.confirmTimers.delete(id);
    }
    this._items.update((list) => list.filter((a) => a.id !== id));
  }

  /**
   * Единый канал смены статуса: применяет входящее уведомление об изменении статуса заказа.
   * Меняет статус в списке (реактивно для UI) и показывает пуш. Если заказа нет или
   * статус не изменился — ничего не делает.
   */
  applyStatusNotification(notification: OrderStatusNotification): void {
    this.confirmTimers.delete(notification.id);

    const order = this._items().find((a) => a.id === notification.id);
    if (!order || order.status === notification.status) {
      return;
    }

    this._items.update((list) =>
      list.map((a) => (a.id === notification.id ? { ...a, status: notification.status } : a)),
    );
    void this.notifications.notify(
      ORDER_STATUS_TITLE,
      statusNotificationBody(order.title, notification.status),
    );
  }

  private responseId(jobId: string): string {
    return `resp-${jobId}`;
  }
}

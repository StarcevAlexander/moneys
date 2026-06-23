import { inject, Injectable, signal } from '@angular/core';
import { RESPONSE_CONFIRM_DELAY_MS, RESPONSE_CONFIRM_TITLE } from '../../core/constants';
import { NotificationService } from '../../core/services';
import { JobPoint } from '../jobs/jobs.models';
import { APPLICATIONS } from './applications.data';
import { JobApplication } from './applications.models';

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
      () => this.confirm(application.id, job.title),
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

  private confirm(id: string, title: string): void {
    this.confirmTimers.delete(id);
    this._items.update((list) => list.map((a) => (a.id === id ? { ...a, status: 'assigned' } : a)));
    void this.notifications.notify(RESPONSE_CONFIRM_TITLE, `Ваш отклик на «${title}» подтверждён`);
  }

  private responseId(jobId: string): string {
    return `resp-${jobId}`;
  }
}

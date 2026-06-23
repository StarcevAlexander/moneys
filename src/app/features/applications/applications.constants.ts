import { ApplicationStatus } from './applications.models';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  awaiting: 'Ожидает подтверждения',
  assigned: 'Назначен',
  requested: 'Запрошено',
  completed: 'Выполнено',
  rejected: 'Отклонено',
};

export const STATUS_ICONS: Record<ApplicationStatus, string> = {
  awaiting: 'pending',
  assigned: 'event_available',
  requested: 'hourglass_top',
  completed: 'task_alt',
  rejected: 'cancel',
};

/** Заголовок пуша об изменении статуса заказа. */
export const ORDER_STATUS_TITLE = 'Moneys';

/** Текст пуша об изменении статуса заказа — по новому статусу. */
export function statusNotificationBody(title: string, status: ApplicationStatus): string {
  switch (status) {
    case 'awaiting':
      return `Заявка на «${title}» ожидает подтверждения`;
    case 'assigned':
      return `Ваш отклик на «${title}» подтверждён`;
    case 'requested':
      return `Заявка на «${title}» отправлена работодателю`;
    case 'completed':
      return `Смена «${title}» завершена`;
    case 'rejected':
      return `Заявка на «${title}» отклонена`;
  }
}

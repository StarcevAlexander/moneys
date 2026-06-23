export type ApplicationStatus = 'awaiting' | 'assigned' | 'requested' | 'completed' | 'rejected';

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  /** Отображаемая дата. */
  date: string;
  /** Дата в ISO (YYYY-MM-DD) — для подсветки на календаре. */
  isoDate: string;
  payout: string;
  status: ApplicationStatus;
  description: string;
}

/**
 * Входящее уведомление об изменении статуса заказа.
 * Несёт id заказа и новый статус — применяется к store как единый канал смены статуса.
 */
export interface OrderStatusNotification {
  id: string;
  status: ApplicationStatus;
}

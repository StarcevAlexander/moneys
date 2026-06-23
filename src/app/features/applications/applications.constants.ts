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

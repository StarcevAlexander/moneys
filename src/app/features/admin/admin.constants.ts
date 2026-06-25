import { AdminOrderStatus, BankDetails, PassportData, WorkerRatingDraft } from './admin.models';

/** Ключи localStorage для админских данных. */
export const ADMIN_USERS_STORAGE_KEY = 'moneys.admin.users';
export const ADMIN_ORDERS_STORAGE_KEY = 'moneys.admin.orders';

/** Задержка дебаунса поиска исполнителя в выпадашке назначения. */
export const ASSIGN_SEARCH_DEBOUNCE_MS = 300;

/** Моковый список доступных населённых пунктов (Иркутская область). */
export const CITIES: string[] = [
  'Иркутск',
  'Ангарск',
  'Шелехов',
  'Братск',
  'Усолье-Сибирское',
  'Усть-Илимск',
  'Черемхово',
  'Саянск',
  'Тулун',
  'Зима',
];

/** Человекочитаемые подписи статусов заявки. */
export const ADMIN_ORDER_STATUS_LABELS: Record<AdminOrderStatus, string> = {
  open: 'Не назначена',
  assigned: 'Назначена',
  in_progress: 'Выполняется',
  done: 'Выполнена',
  paid: 'Оплачена',
  cancelled: 'Отменена',
};

/** Иконки статусов заявки. */
export const ADMIN_ORDER_STATUS_ICONS: Record<AdminOrderStatus, string> = {
  open: 'fiber_new',
  assigned: 'how_to_reg',
  in_progress: 'autorenew',
  done: 'task_alt',
  paid: 'payments',
  cancelled: 'cancel',
};

/**
 * Линейный поток статусов: переход разрешён только на соседний по порядку (±1 шаг).
 * Отмена («cancelled») в поток не входит — это отдельная терминальная ветка.
 */
export const ADMIN_ORDER_FLOW: AdminOrderStatus[] = [
  'open',
  'assigned',
  'in_progress',
  'done',
  'paid',
];

/** Все статусы для фильтра и селектора (поток + отмена). */
export const ADMIN_ORDER_STATUSES: AdminOrderStatus[] = [...ADMIN_ORDER_FLOW, 'cancelled'];

/** Уведомления админ-панели. */
export const ORDER_CREATED_MESSAGE = 'Заявка создана';
export const ORDER_REMOVED_MESSAGE = 'Заявка удалена';
export const ORDER_ASSIGNED_MESSAGE = 'Заявка назначена';
export const ORDER_UNASSIGNED_MESSAGE = 'Назначение снято';
export const ORDER_STATUS_CHANGED_MESSAGE = 'Статус заявки изменён';
export const USER_CREATED_MESSAGE = 'Пользователь добавлен';
export const USER_REMOVED_MESSAGE = 'Пользователь удалён';
export const LOGIN_TAKEN_MESSAGE = 'Такой логин уже занят';
export const BANK_DETAILS_SAVED_MESSAGE = 'Реквизиты сохранены';
export const CITY_SAVED_MESSAGE = 'Город обновлён';

/** Пустые банковские реквизиты по умолчанию. */
export const EMPTY_BANK_DETAILS: BankDetails = {
  recipient: '',
  bankName: '',
  cardNumber: '',
  accountNumber: '',
  bik: '',
};

/** Пустые паспортные данные по умолчанию. */
export const EMPTY_PASSPORT: PassportData = {
  series: '',
  number: '',
  issuedBy: '',
  issuedAt: '',
  birthDate: '',
  registrationAddress: '',
};

/** Максимальный размер стороны загружаемого изображения (для сжатия перед хранением). */
export const UPLOAD_IMAGE_MAX_SIZE = 1280;

/** Максимальный размер стороны аватара пользователя. */
export const AVATAR_IMAGE_MAX_SIZE = 512;

/** Сообщение об обновлении фото пользователя. */
export const PHOTO_SAVED_MESSAGE = 'Фото обновлено';

/** Сообщения регистрации. */
export const REGISTRATION_SUCCESS_MESSAGE = 'Регистрация завершена';
export const REGISTRATION_DOCS_REQUIRED_MESSAGE = 'Загрузите все документы и фото';

/** Границы шкалы оценки работника. */
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Значения шкалы для отрисовки звёзд (1…5). */
export const RATING_SCALE: number[] = [1, 2, 3, 4, 5];

/** Подписи показателей рейтинга. */
export const RATING_RELIABILITY_LABEL = 'Надёжность';
export const RATING_RELIABILITY_HINT = 'Выход на работу';
export const RATING_PERFORMANCE_LABEL = 'Исполнительность';
export const RATING_PERFORMANCE_HINT = 'Оценка работы';

/** Сообщения рейтинга. */
export const RATING_SAVED_MESSAGE = 'Оценка сохранена';
export const RATING_REMOVED_MESSAGE = 'Оценка удалена';

/** Черновик оценки по умолчанию (обе оценки — максимум). */
export const EMPTY_RATING_DRAFT: WorkerRatingDraft = {
  orderId: '',
  reliability: RATING_MAX,
  performance: RATING_MAX,
  comment: '',
};

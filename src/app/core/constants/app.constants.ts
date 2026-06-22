export const MOCK_LOGIN = '123';
export const MOCK_PASSWORD = '123';

export const AUTH_STORAGE_KEY = 'moneys.session';

/** Проверка обновлений раз в сутки. */
export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Минимальное и максимальное время показа заставки. */
export const SPLASH_MIN_DURATION_MS = 1600;
export const SPLASH_MAX_DURATION_MS = 8000;

/** Через сколько после авторизации прилетает пуш о новом заказе. */
export const ORDER_NOTIFICATION_DELAY_MS = 10_000;
export const ORDER_NOTIFICATION_TITLE = 'Moneys';
export const ORDER_NOTIFICATION_BODY = 'Поступил новый заказ';

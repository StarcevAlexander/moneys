export const MOCK_LOGIN = '123';
export const MOCK_PASSWORD = '123';

export const AUTH_STORAGE_KEY = 'moneys.session';

/** Срок жизни сессии — 30 дней. После протухания требуется повторный вход. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Проверка обновлений раз в сутки. */
export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Минимальное время показа заставки. */
export const SPLASH_MIN_DURATION_MS = 1600;

/** Через сколько после авторизации прилетает пуш о новом заказе. */
export const ORDER_NOTIFICATION_DELAY_MS = 10_000;
export const ORDER_NOTIFICATION_TITLE = 'Moneys';
export const ORDER_NOTIFICATION_BODY = 'Поступил новый заказ';

/** Через сколько после нажатия «Тест пуша» прилетает тестовое уведомление. */
export const TEST_NOTIFICATION_DELAY_MS = 5_000;

/** Через сколько после отклика прилетает пуш с подтверждением задачи. */
export const RESPONSE_CONFIRM_DELAY_MS = 10_000;
export const RESPONSE_CONFIRM_TITLE = 'Moneys';

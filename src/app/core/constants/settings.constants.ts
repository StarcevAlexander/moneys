import { ThemeId, ThemeOption, UserProfile } from '../models';

/** Ключ localStorage для выбранной темы. */
export const THEME_STORAGE_KEY = 'moneys.theme';

/** Ключ localStorage для профиля пользователя. */
export const PROFILE_STORAGE_KEY = 'moneys.profile';

/** Тема по умолчанию. */
export const DEFAULT_THEME: ThemeId = 'emerald';

/** Доступные темы оформления. */
export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: 'emerald',
    label: 'Изумруд',
    scheme: 'dark',
    accent: '#ffd24d',
    background: 'radial-gradient(circle at 30% 25%, #0d4f31 0%, #03150e 100%)',
  },
  {
    id: 'light',
    label: 'Светлая',
    scheme: 'light',
    accent: '#0d4f31',
    background: 'radial-gradient(circle at 30% 25%, #ffffff 0%, #e7efe9 100%)',
  },
  {
    id: 'ocean',
    label: 'Океан',
    scheme: 'dark',
    accent: '#4dd0e1',
    background: 'radial-gradient(circle at 30% 25%, #134e6f 0%, #061620 100%)',
  },
  {
    id: 'royal',
    label: 'Аметист',
    scheme: 'dark',
    accent: '#c792ea',
    background: 'radial-gradient(circle at 30% 25%, #4a2d6b 0%, #160a24 100%)',
  },
  {
    id: 'sunset',
    label: 'Закат',
    scheme: 'dark',
    accent: '#ff8a3d',
    background: 'radial-gradient(circle at 30% 25%, #7a3410 0%, #1a0a02 100%)',
  },
  {
    id: 'cherry',
    label: 'Вишня',
    scheme: 'dark',
    accent: '#ff6b81',
    background: 'radial-gradient(circle at 30% 25%, #6b1f2e 0%, #1c0509 100%)',
  },
  {
    id: 'sakura',
    label: 'Сакура',
    scheme: 'light',
    accent: '#d6457a',
    background: 'radial-gradient(circle at 30% 25%, #ffffff 0%, #fbdde7 100%)',
  },
  {
    id: 'midnight',
    label: 'Полночь',
    scheme: 'dark',
    accent: '#6c8cff',
    background: 'radial-gradient(circle at 30% 25%, #1e2a5e 0%, #080c1c 100%)',
  },
];

/** Пустой профиль по умолчанию. */
export const EMPTY_PROFILE: UserProfile = {
  lastName: '',
  firstName: '',
  middleName: '',
  passportSeries: '',
  passportNumber: '',
  passportIssuedBy: '',
  passportIssuedAt: '',
};

/** Заголовок и текст уведомления при отправке в техподдержку. */
export const SUPPORT_SENT_TITLE = 'Техподдержка';
export const SUPPORT_SENT_BODY = 'Сообщение отправлено. Мы ответим в ближайшее время.';

/** Уведомление о сохранении профиля. */
export const PROFILE_SAVED_MESSAGE = 'Профиль сохранён';

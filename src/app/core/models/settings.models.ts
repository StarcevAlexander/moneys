/** Идентификатор темы оформления приложения. */
export type ThemeId =
  | 'emerald'
  | 'light'
  | 'ocean'
  | 'royal'
  | 'sunset'
  | 'cherry'
  | 'sakura'
  | 'midnight';

/** Описание варианта темы для выбора в настройках. */
export interface ThemeOption {
  id: ThemeId;
  label: string;
  /** Светлая или тёмная схема — для подсказки в UI. */
  scheme: 'light' | 'dark';
  /** Акцентный цвет превью-кружка. */
  accent: string;
  /** Базовый фон превью-кружка. */
  background: string;
}

/** Профиль пользователя: ФИО и паспортные данные. */
export interface UserProfile {
  lastName: string;
  firstName: string;
  middleName: string;
  passportSeries: string;
  passportNumber: string;
  passportIssuedBy: string;
  passportIssuedAt: string;
}

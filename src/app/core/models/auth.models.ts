export interface Credentials {
  login: string;
  password: string;
}

/** Роль пользователя: работник или администратор. */
export type UserRole = 'worker' | 'admin';

export interface AuthSession {
  login: string;
  role: UserRole;
  loggedInAt: number;
}

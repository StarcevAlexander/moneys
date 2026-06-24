import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AUTH_STORAGE_KEY,
  MOCK_ADMIN_LOGIN,
  MOCK_ADMIN_PASSWORD,
  MOCK_LOGIN,
  MOCK_PASSWORD,
  SESSION_TTL_MS,
} from '../constants';
import { AuthSession, Credentials, UserRole } from '../models';
import { AdminStore } from '../../features/admin/admin.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly adminStore = inject(AdminStore);
  private readonly session = signal<AuthSession | undefined>(this.restore());

  readonly currentUser = computed(() => this.session());
  readonly isAuthenticated = computed(() => !!this.session());
  readonly role = computed<UserRole | undefined>(() => this.session()?.role);
  readonly isAdmin = computed(() => this.role() === 'admin');

  login(credentials: Credentials): boolean {
    const role = this.resolveRole(credentials);
    if (!role) {
      return false;
    }

    const session: AuthSession = {
      login: credentials.login,
      role,
      loggedInAt: Date.now(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    this.session.set(session);
    return true;
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.session.set(undefined);
  }

  /** Определяет роль по учётным данным или undefined, если они неверны. */
  private resolveRole(credentials: Credentials): UserRole | undefined {
    if (credentials.login === MOCK_LOGIN && credentials.password === MOCK_PASSWORD) {
      return 'worker';
    }
    if (credentials.login === MOCK_ADMIN_LOGIN && credentials.password === MOCK_ADMIN_PASSWORD) {
      return 'admin';
    }
    // Зарегистрированные пользователи входят с ролью работника.
    if (this.adminStore.findByCredentials(credentials.login, credentials.password)) {
      return 'worker';
    }
    return undefined;
  }

  private restore(): AuthSession | undefined {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        return undefined;
      }

      const session = JSON.parse(raw) as unknown;
      if (!this.isValidSession(session) || this.isExpired(session)) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return undefined;
      }

      return session;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return undefined;
    }
  }

  /** Сессия валидна, если это объект с непустым login, корректной ролью и числовым loggedInAt. */
  private isValidSession(value: unknown): value is AuthSession {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const session = value as Partial<AuthSession>;
    return (
      typeof session.login === 'string' &&
      session.login.length > 0 &&
      (session.role === 'worker' || session.role === 'admin') &&
      typeof session.loggedInAt === 'number' &&
      Number.isFinite(session.loggedInAt)
    );
  }

  /** Сессия протухла, если с момента входа прошло больше SESSION_TTL_MS. */
  private isExpired(session: AuthSession): boolean {
    return Date.now() - session.loggedInAt > SESSION_TTL_MS;
  }
}

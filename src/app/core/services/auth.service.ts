import { Injectable, computed, signal } from '@angular/core';
import { AUTH_STORAGE_KEY, MOCK_LOGIN, MOCK_PASSWORD, SESSION_TTL_MS } from '../constants';
import { AuthSession, Credentials } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthSession | undefined>(this.restore());

  readonly currentUser = computed(() => this.session());
  readonly isAuthenticated = computed(() => !!this.session());

  login(credentials: Credentials): boolean {
    const valid = credentials.login === MOCK_LOGIN && credentials.password === MOCK_PASSWORD;
    if (!valid) {
      return false;
    }

    const session: AuthSession = {
      login: credentials.login,
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

  /** Сессия валидна, если это объект с непустым login и числовым loggedInAt. */
  private isValidSession(value: unknown): value is AuthSession {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const session = value as Partial<AuthSession>;
    return (
      typeof session.login === 'string' &&
      session.login.length > 0 &&
      typeof session.loggedInAt === 'number' &&
      Number.isFinite(session.loggedInAt)
    );
  }

  /** Сессия протухла, если с момента входа прошло больше SESSION_TTL_MS. */
  private isExpired(session: AuthSession): boolean {
    return Date.now() - session.loggedInAt > SESSION_TTL_MS;
  }
}

import { Injectable, computed, signal } from '@angular/core';
import { AUTH_STORAGE_KEY, MOCK_LOGIN, MOCK_PASSWORD } from '../constants';
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
      return raw ? (JSON.parse(raw) as AuthSession) : undefined;
    } catch {
      return undefined;
    }
  }
}

import { Injectable, signal } from '@angular/core';
import { EMPTY_PROFILE, PROFILE_STORAGE_KEY } from '../constants';
import { UserProfile } from '../models';

/** Хранение профиля пользователя (ФИО, паспортные данные) в localStorage. */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly _profile = signal<UserProfile>(this.restore());
  readonly profile = this._profile.asReadonly();

  save(profile: UserProfile): void {
    this._profile.set(profile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }

  private restore(): UserProfile {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) {
        return { ...EMPTY_PROFILE };
      }
      const parsed = JSON.parse(raw) as Partial<UserProfile>;
      return { ...EMPTY_PROFILE, ...parsed };
    } catch {
      return { ...EMPTY_PROFILE };
    }
  }
}

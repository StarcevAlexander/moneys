import { Injectable, effect, signal } from '@angular/core';
import { DEFAULT_THEME, THEME_OPTIONS, THEME_STORAGE_KEY } from '../constants';
import { ThemeId } from '../models';

/** Управление темой оформления: хранение выбора и применение к <html>. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly options = THEME_OPTIONS;

  private readonly _current = signal<ThemeId>(this.restore());
  readonly current = this._current.asReadonly();

  constructor() {
    // Любое изменение темы сразу применяем к документу и сохраняем.
    effect(() => this.apply(this._current()));
  }

  setTheme(theme: ThemeId): void {
    this._current.set(theme);
  }

  private apply(theme: ThemeId): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  private restore(): ThemeId {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_OPTIONS.some((option) => option.id === saved) ? (saved as ThemeId) : DEFAULT_THEME;
  }
}

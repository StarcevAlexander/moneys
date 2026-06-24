import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SPLASH_MIN_DURATION_MS } from './core/constants';
import { PwaUpdateService } from './core/services';
import { LoaderScreen } from './shared/components/loader-screen/loader-screen';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderScreen],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App {
  private readonly update = inject(PwaUpdateService);

  protected readonly initializing = signal(true);
  protected readonly updating = this.update.updating;

  constructor() {
    this.update.init();
    void this.boot();
  }

  private async boot(): Promise<void> {
    const start = Date.now();
    // Заставка висит, пока проверяем обновления (в dev резолвится сразу).
    await this.update.checkForUpdate();
    const elapsed = Date.now() - start;
    setTimeout(() => this.initializing.set(false), Math.max(0, SPLASH_MIN_DURATION_MS - elapsed));
  }
}

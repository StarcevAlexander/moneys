import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService, NotificationService } from '../../core/services';
import { APP_VERSION } from '../../core/version';
import { InstallButton } from '../../shared/components/install-button/install-button';
import { STAT_CARDS, TRANSACTIONS } from './home.data';

@Component({
  selector: 'app-home',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, InstallButton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.currentUser;
  protected readonly version = APP_VERSION;
  protected readonly stats = STAT_CARDS;
  protected readonly transactions = TRANSACTIONS;
  protected readonly testPushPending = signal(false);

  async sendTestPush(): Promise<void> {
    if (this.testPushPending()) {
      return;
    }
    this.testPushPending.set(true);
    try {
      // Пуш прилетает через 5 секунд после нажатия.
      await this.notifications.scheduleTestNotification();
    } finally {
      this.testPushPending.set(false);
    }
  }

  logout(): void {
    this.notifications.cancelOrderNotification();
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}

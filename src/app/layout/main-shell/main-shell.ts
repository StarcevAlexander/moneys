import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services';
import { AdminStore } from '../../features/admin/admin.store';
import { SettingsDialog } from '../../shared/components/settings-dialog/settings-dialog';
import { ADMIN_NAV_TABS, WORKER_NAV_TABS } from './main-shell.constants';

@Component({
  selector: 'app-main-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  templateUrl: './main-shell.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-shell.scss',
})
export class MainShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly adminStore = inject(AdminStore);

  protected readonly user = this.auth.currentUser;
  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly tabs = computed(() => (this.isAdmin() ? ADMIN_NAV_TABS : WORKER_NAV_TABS));
  /** Аватар текущего пользователя (data URL) или undefined — тогда иконка. */
  protected readonly avatar = computed(() => {
    const login = this.user()?.login;
    return login ? this.adminStore.userByLogin(login)?.documents?.photo?.dataUrl : undefined;
  });

  openSettings(): void {
    this.dialog.open(SettingsDialog, { autoFocus: false, maxWidth: '95vw' });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}

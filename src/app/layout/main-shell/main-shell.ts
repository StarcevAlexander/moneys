import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services';
import { SettingsDialog } from '../../shared/components/settings-dialog/settings-dialog';
import { NAV_TABS } from './main-shell.constants';

@Component({
  selector: 'app-main-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  templateUrl: './main-shell.html',
  styleUrl: './main-shell.scss',
})
export class MainShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly tabs = NAV_TABS;
  protected readonly user = this.auth.currentUser;

  openSettings(): void {
    this.dialog.open(SettingsDialog, { autoFocus: false, maxWidth: '95vw' });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}

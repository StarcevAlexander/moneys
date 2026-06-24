import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PwaInstallService } from '../../../core/services';

@Component({
  selector: 'app-install-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './install-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './install-button.scss',
})
export class InstallButton {
  private readonly install = inject(PwaInstallService);

  protected readonly canInstall = this.install.canInstall;
  protected readonly needsIosHint = this.install.needsIosHint;
  protected readonly iosDialogOpen = signal(false);

  onInstall(): void {
    if (this.needsIosHint()) {
      this.iosDialogOpen.set(true);
      return;
    }
    void this.install.promptInstall();
  }

  closeIosDialog(): void {
    this.iosDialogOpen.set(false);
  }
}

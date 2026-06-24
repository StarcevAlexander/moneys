import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, maxLength, minLength, required, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { PROFILE_SAVED_MESSAGE, SUPPORT_SENT_BODY } from '../../../core/constants';
import { AuthService, ProfileService, ThemeService } from '../../../core/services';
import { ThemeId } from '../../../core/models';
import {
  BANK_DETAILS_SAVED_MESSAGE,
  EMPTY_BANK_DETAILS,
} from '../../../features/admin/admin.constants';
import { AdminStore } from '../../../features/admin/admin.store';

/** Диалог настроек: профиль, реквизиты, тема оформления и обращение в техподдержку. */
@Component({
  selector: 'app-settings-dialog',
  imports: [
    FormsModule,
    FormField,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './settings-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './settings-dialog.scss',
})
export class SettingsDialog {
  private readonly profileService = inject(ProfileService);
  private readonly themeService = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly adminStore = inject(AdminStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject<MatDialogRef<SettingsDialog>>(MatDialogRef);

  protected readonly themes = this.themeService.options;
  protected readonly currentTheme = this.themeService.current;

  /** Запись пользователя для текущего логина — источник его реквизитов. */
  protected readonly bankUser = computed(() => {
    const login = this.auth.currentUser()?.login;
    return login ? this.adminStore.userByLogin(login) : undefined;
  });
  protected readonly hasBank = computed(() => !!this.bankUser());

  private readonly profile = signal(this.profileService.profile());
  protected readonly profileForm = form(this.profile, (path) => {
    maxLength(path.passportSeries, 4);
    maxLength(path.passportNumber, 6);
  });

  private readonly bank = signal({ ...EMPTY_BANK_DETAILS, ...this.bankUser()?.bankDetails });
  protected readonly bankForm = form(this.bank);

  private readonly support = signal({ message: '' });
  protected readonly supportForm = form(this.support, (path) => {
    required(path.message, { message: 'Введите сообщение' });
    minLength(path.message, 10, { message: 'Минимум 10 символов' });
  });

  selectTheme(theme: ThemeId): void {
    this.themeService.setTheme(theme);
  }

  saveProfile(): void {
    this.profileService.save(this.profile());
    this.snackBar.open(PROFILE_SAVED_MESSAGE, undefined, { duration: 2500 });
  }

  saveBank(): void {
    const user = this.bankUser();
    if (!user) {
      return;
    }
    this.adminStore.updateBankDetails(user.id, this.bank());
    this.snackBar.open(BANK_DETAILS_SAVED_MESSAGE, undefined, { duration: 2000 });
  }

  sendSupport(): void {
    if (this.supportForm().invalid()) {
      this.supportForm.message().markAsTouched();
      return;
    }

    // Бэка нет — имитируем отправку и подтверждаем приём обращения.
    this.supportForm().reset();
    this.snackBar.open(SUPPORT_SENT_BODY, undefined, { duration: 3000 });
  }

  close(): void {
    this.dialogRef.close();
  }
}

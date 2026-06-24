import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

/** Диалог настроек: профиль, тема оформления и обращение в техподдержку. */
@Component({
  selector: 'app-settings-dialog',
  imports: [
    ReactiveFormsModule,
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
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly themeService = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly adminStore = inject(AdminStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject<MatDialogRef<SettingsDialog>>(MatDialogRef);

  protected readonly themes = this.themeService.options;
  protected readonly currentTheme = this.themeService.current;
  protected readonly supportSending = signal(false);

  /** Запись пользователя для текущего логина — источник его реквизитов. */
  protected readonly bankUser = computed(() => {
    const login = this.auth.currentUser()?.login;
    return login ? this.adminStore.userByLogin(login) : undefined;
  });
  protected readonly hasBank = computed(() => !!this.bankUser());

  protected readonly bankForm = this.fb.nonNullable.group({
    recipient: [''],
    bankName: [''],
    cardNumber: [''],
    accountNumber: [''],
    bik: [''],
  });

  protected readonly profileForm = this.fb.nonNullable.group({
    lastName: [''],
    firstName: [''],
    middleName: [''],
    passportSeries: [''],
    passportNumber: [''],
    passportIssuedBy: [''],
    passportIssuedAt: [''],
  });

  protected readonly supportForm = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    this.profileForm.setValue(this.profileService.profile());
    this.bankForm.patchValue({ ...EMPTY_BANK_DETAILS, ...this.bankUser()?.bankDetails });
  }

  selectTheme(theme: ThemeId): void {
    this.themeService.setTheme(theme);
  }

  saveBank(): void {
    const user = this.bankUser();
    if (!user) {
      return;
    }
    this.adminStore.updateBankDetails(user.id, this.bankForm.getRawValue());
    this.snackBar.open(BANK_DETAILS_SAVED_MESSAGE, undefined, { duration: 2000 });
  }

  saveProfile(): void {
    this.profileService.save(this.profileForm.getRawValue());
    this.snackBar.open(PROFILE_SAVED_MESSAGE, undefined, { duration: 2500 });
  }

  sendSupport(): void {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    // Бэка нет — имитируем отправку и подтверждаем приём обращения.
    this.supportSending.set(true);
    this.supportForm.reset();
    this.supportSending.set(false);
    this.snackBar.open(SUPPORT_SENT_BODY, undefined, { duration: 3000 });
  }

  close(): void {
    this.dialogRef.close();
  }
}

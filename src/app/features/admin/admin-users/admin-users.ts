import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ADMIN_ORDER_STATUS_ICONS,
  ADMIN_ORDER_STATUS_LABELS,
  BANK_DETAILS_SAVED_MESSAGE,
  EMPTY_BANK_DETAILS,
  LOGIN_TAKEN_MESSAGE,
  USER_CREATED_MESSAGE,
  USER_REMOVED_MESSAGE,
} from '../admin.constants';
import { AdminOrder, ManagedUser } from '../admin.models';
import { AdminStore } from '../admin.store';

/** Админ-панель: пользователи, их заявки и банковские реквизиты. */
@Component({
  selector: 'app-admin-users',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './admin-users.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-users.scss',
})
export class AdminUsers {
  private readonly store = inject(AdminStore);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly users = this.store.users;
  protected readonly statusLabels = ADMIN_ORDER_STATUS_LABELS;
  protected readonly statusIcons = ADMIN_ORDER_STATUS_ICONS;
  protected readonly formOpen = signal(false);
  /** id раскрытого пользователя (карточка с заявками и реквизитами). */
  protected readonly expandedId = signal<string | undefined>(undefined);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    login: ['', Validators.required],
  });

  protected readonly bankForm = this.fb.nonNullable.group({
    recipient: [''],
    bankName: [''],
    cardNumber: [''],
    accountNumber: [''],
    bik: [''],
  });

  ordersOf(userId: string): AdminOrder[] {
    return this.store.ordersForUser(userId);
  }

  toggleExpand(user: ManagedUser): void {
    if (this.expandedId() === user.id) {
      this.expandedId.set(undefined);
      return;
    }
    this.expandedId.set(user.id);
    this.bankForm.setValue({ ...EMPTY_BANK_DETAILS, ...user.bankDetails });
  }

  saveBank(userId: string): void {
    this.store.updateBankDetails(userId, this.bankForm.getRawValue());
    this.snackBar.open(BANK_DETAILS_SAVED_MESSAGE, undefined, { duration: 2000 });
  }

  toggleForm(): void {
    this.formOpen.update((v) => !v);
  }

  createUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { login } = this.form.getRawValue();
    if (this.store.isLoginTaken(login)) {
      this.snackBar.open(LOGIN_TAKEN_MESSAGE, undefined, { duration: 2500 });
      return;
    }

    this.store.addUser(this.form.getRawValue());
    this.form.reset();
    this.formOpen.set(false);
    this.snackBar.open(USER_CREATED_MESSAGE, undefined, { duration: 2500 });
  }

  toggleActive(id: string): void {
    this.store.toggleUserActive(id);
  }

  removeUser(id: string): void {
    this.store.removeUser(id);
    if (this.expandedId() === id) {
      this.expandedId.set(undefined);
    }
    this.snackBar.open(USER_REMOVED_MESSAGE, undefined, { duration: 2000 });
  }
}

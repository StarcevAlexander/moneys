import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form, required, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ADMIN_ORDER_STATUS_ICONS,
  ADMIN_ORDER_STATUS_LABELS,
  BANK_DETAILS_SAVED_MESSAGE,
  CITIES,
  CITY_SAVED_MESSAGE,
  EMPTY_BANK_DETAILS,
  LOGIN_TAKEN_MESSAGE,
  RATING_PERFORMANCE_HINT,
  RATING_PERFORMANCE_LABEL,
  RATING_RELIABILITY_HINT,
  RATING_RELIABILITY_LABEL,
  RATING_REMOVED_MESSAGE,
  RATING_SCALE,
  USER_CREATED_MESSAGE,
  USER_REMOVED_MESSAGE,
} from '../admin.constants';
import { AdminOrder, ManagedUser, WorkerRatingSummary } from '../admin.models';
import { AdminStore } from '../admin.store';

/** Админ-панель: пользователи, их заявки и банковские реквизиты. */
@Component({
  selector: 'app-admin-users',
  imports: [
    DecimalPipe,
    FormsModule,
    FormField,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-users.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-users.scss',
})
export class AdminUsers {
  private readonly store = inject(AdminStore);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly statusLabels = ADMIN_ORDER_STATUS_LABELS;
  protected readonly statusIcons = ADMIN_ORDER_STATUS_ICONS;
  protected readonly allCities = CITIES;
  protected readonly ratingScale = RATING_SCALE;
  protected readonly reliabilityLabel = RATING_RELIABILITY_LABEL;
  protected readonly reliabilityHint = RATING_RELIABILITY_HINT;
  protected readonly performanceLabel = RATING_PERFORMANCE_LABEL;
  protected readonly performanceHint = RATING_PERFORMANCE_HINT;
  protected readonly formOpen = signal(false);
  /** id раскрытого пользователя (карточка с заявками и реквизитами). */
  protected readonly expandedId = signal<string | undefined>(undefined);

  // Фильтр пользователей: выбранный город + поиск по ФИО.
  protected readonly cityFilter = signal('');
  protected readonly nameFilter = signal('');
  /** Список городов из имеющихся пользователей (для выпадающего списка фильтра). */
  protected readonly cities = computed(() =>
    [
      ...new Set(
        this.store
          .users()
          .map((u) => u.city)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, 'ru')),
  );
  protected readonly users = computed(() => {
    const city = this.cityFilter();
    const name = this.nameFilter().trim().toLowerCase();
    return this.store
      .users()
      .filter(
        (u) => (!city || u.city === city) && (!name || u.fullName.toLowerCase().includes(name)),
      );
  });
  protected readonly totalUsers = this.store.users;

  // Сигнальная форма добавления пользователя.
  private readonly newUser = signal({ fullName: '', login: '', city: '' });
  protected readonly userForm = form(this.newUser, (path) => {
    required(path.fullName, { message: 'Укажите ФИО' });
    required(path.login, { message: 'Укажите логин' });
    required(path.city, { message: 'Укажите населённый пункт' });
  });

  // Сигнальная форма банковских реквизитов.
  private readonly bank = signal({ ...EMPTY_BANK_DETAILS });
  protected readonly bankForm = form(this.bank);

  ordersOf(userId: string): AdminOrder[] {
    return this.store.ordersForUser(userId);
  }

  /** Сводный рейтинг работника по обоим показателям. */
  summaryOf(userId: string): WorkerRatingSummary {
    return this.store.ratingSummary(userId);
  }

  /** Название заявки по её id (для подписи оценки), пустая строка — если не найдена. */
  orderTitle(orderId?: string): string {
    if (!orderId) {
      return '';
    }
    return this.store.orders().find((o) => o.id === orderId)?.title ?? '';
  }

  toggleExpand(user: ManagedUser): void {
    if (this.expandedId() === user.id) {
      this.expandedId.set(undefined);
      return;
    }
    this.expandedId.set(user.id);
    this.bank.set({ ...EMPTY_BANK_DETAILS, ...user.bankDetails });
  }

  removeRating(userId: string, ratingId: string): void {
    this.store.removeRating(userId, ratingId);
    this.snackBar.open(RATING_REMOVED_MESSAGE, undefined, { duration: 2000 });
  }

  saveBank(userId: string): void {
    this.store.updateBankDetails(userId, this.bank());
    this.snackBar.open(BANK_DETAILS_SAVED_MESSAGE, undefined, { duration: 2000 });
  }

  /** Сменить город работника прямо из карточки. */
  setCity(userId: string, city: string): void {
    this.store.updateCity(userId, city);
    this.snackBar.open(CITY_SAVED_MESSAGE, undefined, { duration: 2000 });
  }

  onNameFilter(event: Event): void {
    this.nameFilter.set((event.target as HTMLInputElement).value);
  }

  toggleForm(): void {
    this.formOpen.update((v) => !v);
  }

  createUser(): void {
    if (this.userForm().invalid()) {
      this.userForm.fullName().markAsTouched();
      this.userForm.login().markAsTouched();
      this.userForm.city().markAsTouched();
      return;
    }

    if (this.store.isLoginTaken(this.newUser().login)) {
      this.snackBar.open(LOGIN_TAKEN_MESSAGE, undefined, { duration: 2500 });
      return;
    }

    this.store.addUser(this.newUser());
    this.userForm().reset();
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

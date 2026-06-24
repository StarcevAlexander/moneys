import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs';
import {
  ADMIN_ORDER_STATUS_ICONS,
  ADMIN_ORDER_STATUS_LABELS,
  ADMIN_ORDER_STATUSES,
  ASSIGN_SEARCH_DEBOUNCE_MS,
  ORDER_ASSIGNED_MESSAGE,
  ORDER_CREATED_MESSAGE,
  ORDER_REMOVED_MESSAGE,
  ORDER_STATUS_CHANGED_MESSAGE,
  ORDER_UNASSIGNED_MESSAGE,
} from '../admin.constants';
import { AdminOrder, AdminOrderStatus, ManagedUser } from '../admin.models';
import { AdminStore } from '../admin.store';

/** Админ-панель: создание заявок и контроль их назначения на пользователей. */
@Component({
  selector: 'app-admin-orders',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './admin-orders.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-orders.scss',
})
export class AdminOrders {
  private readonly store = inject(AdminStore);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly orders = this.store.orders;
  protected readonly users = this.store.assignableUsers;
  protected readonly statusLabels = ADMIN_ORDER_STATUS_LABELS;
  protected readonly statusIcons = ADMIN_ORDER_STATUS_ICONS;
  protected readonly statuses = ADMIN_ORDER_STATUSES;
  protected readonly formOpen = signal(false);

  // Поиск исполнителя в выпадашке: сырой ввод + значение после дебаунса.
  private readonly rawQuery = signal('');
  protected readonly query = this.rawQuery.asReadonly();
  private readonly debouncedQuery = toSignal(
    toObservable(this.rawQuery).pipe(debounceTime(ASSIGN_SEARCH_DEBOUNCE_MS)),
    { initialValue: '' },
  );

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    company: ['', Validators.required],
    address: [''],
    payout: [''],
    schedule: [''],
    description: [''],
  });

  toggleForm(): void {
    this.formOpen.update((v) => !v);
  }

  /**
   * Кандидаты на назначение с учётом поискового запроса (по ФИО и логину).
   * Назначенный исполнитель всегда в списке — чтобы селект показывал текущее значение.
   */
  assignableFor(order: AdminOrder): ManagedUser[] {
    const q = this.debouncedQuery().trim().toLowerCase();
    return this.users().filter(
      (u) =>
        u.id === order.assignedUserId ||
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.login.toLowerCase().includes(q),
    );
  }

  onSearch(event: Event): void {
    this.rawQuery.set((event.target as HTMLInputElement).value);
  }

  resetSearch(): void {
    this.rawQuery.set('');
  }

  createOrder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.addOrder(this.form.getRawValue());
    this.form.reset();
    this.formOpen.set(false);
    this.snackBar.open(ORDER_CREATED_MESSAGE, undefined, { duration: 2500 });
  }

  onAssign(orderId: string, userId: string): void {
    const assignedTo = userId || undefined;
    this.store.assignOrder(orderId, assignedTo);
    this.snackBar.open(assignedTo ? ORDER_ASSIGNED_MESSAGE : ORDER_UNASSIGNED_MESSAGE, undefined, {
      duration: 2000,
    });
  }

  onStatusChange(orderId: string, status: AdminOrderStatus): void {
    this.store.setStatus(orderId, status);
    this.snackBar.open(ORDER_STATUS_CHANGED_MESSAGE, undefined, { duration: 2000 });
  }

  removeOrder(orderId: string): void {
    this.store.removeOrder(orderId);
    this.snackBar.open(ORDER_REMOVED_MESSAGE, undefined, { duration: 2000 });
  }
}

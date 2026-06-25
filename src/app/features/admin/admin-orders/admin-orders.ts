import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { form, required, FormField } from '@angular/forms/signals';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs';
import {
  ADMIN_ORDER_FLOW,
  ADMIN_ORDER_STATUS_ICONS,
  ADMIN_ORDER_STATUS_LABELS,
  ADMIN_ORDER_STATUSES,
  ASSIGN_SEARCH_DEBOUNCE_MS,
  CITIES,
  EMPTY_RATING_DRAFT,
  ORDER_ASSIGNED_MESSAGE,
  ORDER_CREATED_MESSAGE,
  ORDER_REMOVED_MESSAGE,
  ORDER_STATUS_CHANGED_MESSAGE,
  ORDER_UNASSIGNED_MESSAGE,
  RATING_PERFORMANCE_HINT,
  RATING_PERFORMANCE_LABEL,
  RATING_RELIABILITY_HINT,
  RATING_RELIABILITY_LABEL,
  RATING_REMOVED_MESSAGE,
  RATING_SAVED_MESSAGE,
  RATING_SCALE,
} from '../admin.constants';
import { AdminOrder, AdminOrderStatus, ManagedUser, WorkerRatingDraft } from '../admin.models';
import { AdminStore } from '../admin.store';

/** Админ-панель: создание заявок и контроль их назначения на пользователей. */
@Component({
  selector: 'app-admin-orders',
  imports: [
    FormsModule,
    FormField,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  templateUrl: './admin-orders.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-orders.scss',
})
export class AdminOrders {
  private readonly store = inject(AdminStore);
  private readonly snackBar = inject(MatSnackBar);

  private readonly allUsers = this.store.users;
  protected readonly totalOrders = this.store.orders;
  protected readonly users = this.store.assignableUsers;
  protected readonly statusLabels = ADMIN_ORDER_STATUS_LABELS;
  protected readonly statusIcons = ADMIN_ORDER_STATUS_ICONS;
  protected readonly statuses = ADMIN_ORDER_STATUSES;
  protected readonly allCities = CITIES;
  protected readonly ratingScale = RATING_SCALE;
  protected readonly reliabilityLabel = RATING_RELIABILITY_LABEL;
  protected readonly reliabilityHint = RATING_RELIABILITY_HINT;
  protected readonly performanceLabel = RATING_PERFORMANCE_LABEL;
  protected readonly performanceHint = RATING_PERFORMANCE_HINT;
  protected readonly formOpen = signal(false);

  /** Черновики оценок по выполненным заявкам, ключ — id заявки. */
  private readonly ratingDrafts = signal<Record<string, WorkerRatingDraft>>({});

  // Фильтр заявок по статусу ('all' — все статусы).
  protected readonly statusFilter = signal<AdminOrderStatus | 'all'>('all');
  protected readonly visibleOrders = computed(() => {
    const status = this.statusFilter();
    const all = this.store.orders();
    return status === 'all' ? all : all.filter((o) => o.status === status);
  });
  /** Количество заявок по каждому статусу — для подписей переключателя. */
  protected readonly counts = computed(() => {
    const acc: Record<AdminOrderStatus, number> = {
      open: 0,
      assigned: 0,
      in_progress: 0,
      done: 0,
      paid: 0,
      cancelled: 0,
    };
    for (const order of this.store.orders()) {
      acc[order.status]++;
    }
    return acc;
  });

  // Поиск исполнителя в автокомплите: сырой ввод + значение после дебаунса (300 мс).
  private readonly rawQuery = signal('');
  private readonly debouncedQuery = toSignal(
    toObservable(this.rawQuery).pipe(debounceTime(ASSIGN_SEARCH_DEBOUNCE_MS)),
    { initialValue: '' },
  );

  // Сигнальная форма создания заявки.
  private readonly newOrder = signal({
    title: '',
    company: '',
    city: '',
    address: '',
    payout: '',
    schedule: '',
    description: '',
  });
  protected readonly form = form(this.newOrder, (path) => {
    required(path.title, { message: 'Укажите название' });
    required(path.company, { message: 'Укажите компанию' });
    required(path.city, { message: 'Укажите город' });
  });

  /** Подпись выбранного статуса для пустого состояния. */
  statusFilterLabel(): string {
    const status = this.statusFilter();
    return status === 'all' ? '' : this.statusLabels[status];
  }

  toggleForm(): void {
    this.formOpen.update((v) => !v);
  }

  /** Имя назначенного исполнителя (пустая строка, если не назначен). */
  assigneeName(order: AdminOrder): string {
    return this.allUsers().find((u) => u.id === order.assignedUserId)?.fullName ?? '';
  }

  /**
   * Кандидаты на назначение: только активные исполнители из города заявки,
   * дополнительно отфильтрованные по поисковому запросу (ФИО/логин, дебаунс 300 мс).
   */
  assignableFor(order: AdminOrder): ManagedUser[] {
    const q = this.debouncedQuery().trim().toLowerCase();
    return this.users().filter(
      (u) =>
        // У заявок без города (старые данные) фильтр по городу не применяем.
        (!order.city || u.city === order.city) &&
        (!q || u.fullName.toLowerCase().includes(q) || u.login.toLowerCase().includes(q)),
    );
  }

  onSearch(event: Event): void {
    this.rawQuery.set((event.target as HTMLInputElement).value);
  }

  resetSearch(): void {
    this.rawQuery.set('');
  }

  createOrder(): void {
    if (this.form().invalid()) {
      this.form.title().markAsTouched();
      this.form.company().markAsTouched();
      this.form.city().markAsTouched();
      return;
    }

    this.store.addOrder(this.newOrder());
    this.form().reset();
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

  /**
   * Доступность статуса при смене:
   * — внутри линейного потока разрешён только соседний шаг (±1);
   * — отменить можно активную работу (не назначена / назначена / выполняется);
   * — из отменённой работу можно только вернуть в «не назначена».
   */
  isStatusReachable(order: AdminOrder, status: AdminOrderStatus): boolean {
    if (status === order.status) {
      return true;
    }
    if (order.status === 'cancelled') {
      return status === 'open';
    }
    if (status === 'cancelled') {
      return (
        order.status === 'open' || order.status === 'assigned' || order.status === 'in_progress'
      );
    }
    return Math.abs(ADMIN_ORDER_FLOW.indexOf(status) - ADMIN_ORDER_FLOW.indexOf(order.status)) <= 1;
  }

  onStatusChange(order: AdminOrder, status: AdminOrderStatus): void {
    if (status === order.status || !this.isStatusReachable(order, status)) {
      return;
    }
    this.store.setStatus(order.id, status);
    this.snackBar.open(ORDER_STATUS_CHANGED_MESSAGE, undefined, { duration: 2000 });
  }

  removeOrder(orderId: string): void {
    this.store.removeOrder(orderId);
    this.snackBar.open(ORDER_REMOVED_MESSAGE, undefined, { duration: 2000 });
  }

  // --- Оценка выполненной работы --------------------------------------------

  /** Уже выставленная за заявку оценка (если работу оценили). */
  ratingForOrder(order: AdminOrder) {
    return this.store.ratingForOrder(order.id);
  }

  /** Текущий черновик оценки для заявки (по умолчанию — максимум по обоим показателям). */
  ratingDraft(orderId: string): WorkerRatingDraft {
    return this.ratingDrafts()[orderId] ?? { ...EMPTY_RATING_DRAFT, orderId };
  }

  setReliability(orderId: string, value: number): void {
    this.patchDraft(orderId, { reliability: value });
  }

  setPerformance(orderId: string, value: number): void {
    this.patchDraft(orderId, { performance: value });
  }

  setRatingComment(orderId: string, event: Event): void {
    this.patchDraft(orderId, { comment: (event.target as HTMLTextAreaElement).value });
  }

  /** Выставить работнику оценку за выполненную заявку. */
  saveRating(order: AdminOrder): void {
    if (!order.assignedUserId) {
      return;
    }
    this.store.rateWorker(order.assignedUserId, this.ratingDraft(order.id));
    this.clearDraft(order.id);
    this.snackBar.open(RATING_SAVED_MESSAGE, undefined, { duration: 2000 });
  }

  /** Снять оценку, чтобы выставить её заново. */
  removeRating(userId: string, ratingId: string): void {
    this.store.removeRating(userId, ratingId);
    this.snackBar.open(RATING_REMOVED_MESSAGE, undefined, { duration: 2000 });
  }

  private patchDraft(orderId: string, patch: Partial<WorkerRatingDraft>): void {
    this.ratingDrafts.update((drafts) => ({
      ...drafts,
      [orderId]: { ...this.ratingDraft(orderId), ...patch },
    }));
  }

  private clearDraft(orderId: string): void {
    this.ratingDrafts.update((drafts) => {
      const { [orderId]: _removed, ...rest } = drafts;
      return rest;
    });
  }
}

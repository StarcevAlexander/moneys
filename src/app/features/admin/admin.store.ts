import { computed, effect, Injectable, signal } from '@angular/core';
import { ADMIN_ORDERS_STORAGE_KEY, ADMIN_USERS_STORAGE_KEY } from './admin.constants';
import { DEFAULT_ORDERS, DEFAULT_USERS } from './admin.data';
import {
  AdminOrder,
  AdminOrderStatus,
  BankDetails,
  ManagedUser,
  NewOrderDraft,
  NewUserDraft,
  RegistrationDraft,
  UploadedFile,
} from './admin.models';

/** Реактивное состояние админ-панели: пользователи и заявки с персистом в localStorage. */
@Injectable({ providedIn: 'root' })
export class AdminStore {
  private readonly _users = signal<ManagedUser[]>(
    this.restore(ADMIN_USERS_STORAGE_KEY, DEFAULT_USERS),
  );
  private readonly _orders = signal<AdminOrder[]>(
    this.restore(ADMIN_ORDERS_STORAGE_KEY, DEFAULT_ORDERS),
  );

  readonly users = this._users.asReadonly();
  readonly orders = this._orders.asReadonly();

  /** Только активные пользователи — кандидаты на назначение. */
  readonly assignableUsers = computed(() => this._users().filter((u) => u.active));

  constructor() {
    // Любое изменение состояния сразу сохраняем в localStorage.
    // В try/catch — потому что фото/документы пользователей могут переполнить квоту.
    effect(() => this.persist(ADMIN_USERS_STORAGE_KEY, this._users()));
    effect(() => this.persist(ADMIN_ORDERS_STORAGE_KEY, this._orders()));
  }

  private persist(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Переполнение квоты localStorage — состояние остаётся в памяти.
    }
  }

  // --- Заявки ---------------------------------------------------------------

  addOrder(draft: NewOrderDraft): void {
    const order: AdminOrder = { id: crypto.randomUUID(), status: 'open', ...draft };
    this._orders.update((list) => [order, ...list]);
  }

  removeOrder(id: string): void {
    this._orders.update((list) => list.filter((o) => o.id !== id));
  }

  /** Заявки, назначенные на конкретного пользователя. */
  ordersForUser(userId: string): AdminOrder[] {
    return this._orders().filter((o) => o.assignedUserId === userId);
  }

  /**
   * Назначение заявки на пользователя или снятие назначения (userId не задан).
   * Статус подстраивается только на границе open↔assigned, не затирая done/paid.
   */
  assignOrder(orderId: string, userId?: string): void {
    this._orders.update((list) =>
      list.map((o) => {
        if (o.id !== orderId) {
          return o;
        }
        let status = o.status;
        if (userId && o.status === 'open') {
          status = 'assigned';
        } else if (!userId && o.status === 'assigned') {
          status = 'open';
        }
        return { ...o, assignedUserId: userId, status };
      }),
    );
  }

  /** Произвольная смена статуса заявки администратором на любом этапе. */
  setStatus(orderId: string, status: AdminOrderStatus): void {
    this._orders.update((list) => list.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  // --- Пользователи ---------------------------------------------------------

  /** true, если логин уже занят (без учёта регистра). */
  isLoginTaken(login: string): boolean {
    const normalized = login.trim().toLowerCase();
    return this._users().some((u) => u.login.toLowerCase() === normalized);
  }

  /** Пользователь по логину (без учёта регистра). */
  userByLogin(login: string): ManagedUser | undefined {
    const normalized = login.trim().toLowerCase();
    return this._users().find((u) => u.login.toLowerCase() === normalized);
  }

  /** Поиск активного пользователя по логину и паролю (для входа зарегистрированных). */
  findByCredentials(login: string, password: string): ManagedUser | undefined {
    const user = this.userByLogin(login);
    return user && user.active && user.password === password ? user : undefined;
  }

  /** Регистрация нового пользователя. Возвращает созданную запись. */
  register(draft: RegistrationDraft): ManagedUser {
    const user: ManagedUser = {
      id: crypto.randomUUID(),
      login: draft.login.trim(),
      fullName: draft.fullName.trim(),
      city: draft.city.trim(),
      active: true,
      password: draft.password,
      passport: draft.passport,
      bankDetails: draft.bankDetails,
      documents: draft.documents,
    };
    this._users.update((list) => [user, ...list]);
    return user;
  }

  /** Обновление банковских реквизитов пользователя (правит и админ, и сам юзер). */
  updateBankDetails(userId: string, bankDetails: BankDetails): void {
    this._users.update((list) => list.map((u) => (u.id === userId ? { ...u, bankDetails } : u)));
  }

  /** Обновление фото (аватара) пользователя. */
  updatePhoto(userId: string, photo: UploadedFile): void {
    this._users.update((list) =>
      list.map((u) => (u.id === userId ? { ...u, documents: { ...u.documents, photo } } : u)),
    );
  }

  addUser(draft: NewUserDraft): void {
    const user: ManagedUser = {
      id: crypto.randomUUID(),
      login: draft.login.trim(),
      fullName: draft.fullName.trim(),
      city: draft.city.trim(),
      active: true,
    };
    this._users.update((list) => [user, ...list]);
  }

  toggleUserActive(id: string): void {
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  }

  /** Удаление пользователя и снятие его назначений с заявок. */
  removeUser(id: string): void {
    this._users.update((list) => list.filter((u) => u.id !== id));
    this._orders.update((list) =>
      list.map((o) =>
        o.assignedUserId === id ? { ...o, assignedUserId: undefined, status: 'open' } : o,
      ),
    );
  }

  private restore<T>(key: string, fallback: T[]): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return [...fallback];
      }
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [...fallback];
    } catch {
      return [...fallback];
    }
  }
}

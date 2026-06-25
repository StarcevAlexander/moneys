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
  QualificationDocument,
  QualificationReviewDraft,
  QualificationUpload,
  RegistrationDraft,
  UploadedFile,
  WorkerRating,
  WorkerRatingDraft,
  WorkerRatingSummary,
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

  /** Смена города пользователя (правит и админ в карточке, и сам работник в профиле). */
  updateCity(userId: string, city: string): void {
    this._users.update((list) => list.map((u) => (u.id === userId ? { ...u, city } : u)));
  }

  /** Обновление фото (аватара) пользователя. */
  updatePhoto(userId: string, photo: UploadedFile): void {
    this._users.update((list) =>
      list.map((u) => (u.id === userId ? { ...u, documents: { ...u.documents, photo } } : u)),
    );
  }

  // --- Документы доп. образования / допусков ---------------------------------

  /** Работник загружает квалификационный документ — он уходит на проверку. */
  addQualification(userId: string, upload: QualificationUpload): void {
    const doc: QualificationDocument = {
      id: crypto.randomUUID(),
      title: upload.title.trim(),
      file: upload.file,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
    };
    this._users.update((list) =>
      list.map((u) =>
        u.id === userId ? { ...u, qualifications: [doc, ...(u.qualifications ?? [])] } : u,
      ),
    );
  }

  /** Удаление документа (работником — своего непроверенного, либо менеджером). */
  removeQualification(userId: string, docId: string): void {
    this._users.update((list) =>
      list.map((u) =>
        u.id === userId
          ? { ...u, qualifications: (u.qualifications ?? []).filter((d) => d.id !== docId) }
          : u,
      ),
    );
  }

  /** Менеджер проверяет документ: вносит реквизиты, срок действия и вердикт. */
  reviewQualification(userId: string, docId: string, draft: QualificationReviewDraft): void {
    this._users.update((list) =>
      list.map((u) => {
        if (u.id !== userId) {
          return u;
        }
        const qualifications = (u.qualifications ?? []).map((d) =>
          d.id === docId
            ? {
                ...d,
                status: draft.status,
                series: draft.series?.trim() || undefined,
                number: draft.number?.trim() || undefined,
                issuedBy: draft.issuedBy?.trim() || undefined,
                validFrom: draft.validFrom?.trim() || undefined,
                validTo: draft.validTo?.trim() || undefined,
                reviewComment: draft.reviewComment?.trim() || undefined,
                reviewedAt: new Date().toISOString(),
              }
            : d,
        );
        return { ...u, qualifications };
      }),
    );
  }

  // --- Рейтинг работника -----------------------------------------------------

  /** Выставить работнику оценку по надёжности и исполнительности. */
  rateWorker(userId: string, draft: WorkerRatingDraft): void {
    const rating: WorkerRating = {
      id: crypto.randomUUID(),
      orderId: draft.orderId || undefined,
      reliability: draft.reliability,
      performance: draft.performance,
      comment: draft.comment?.trim() || undefined,
      ratedAt: new Date().toISOString(),
    };
    this._users.update((list) =>
      list.map((u) => (u.id === userId ? { ...u, ratings: [rating, ...(u.ratings ?? [])] } : u)),
    );
  }

  /** Оценка, выставленная за конкретную заявку (если работу уже оценили). */
  ratingForOrder(orderId: string): WorkerRating | undefined {
    for (const user of this._users()) {
      const found = (user.ratings ?? []).find((r) => r.orderId === orderId);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  /** Удалить ранее выставленную оценку работника. */
  removeRating(userId: string, ratingId: string): void {
    this._users.update((list) =>
      list.map((u) =>
        u.id === userId ? { ...u, ratings: (u.ratings ?? []).filter((r) => r.id !== ratingId) } : u,
      ),
    );
  }

  /** Сводный рейтинг работника: средние по обоим показателям и общий балл. */
  ratingSummary(userId: string): WorkerRatingSummary {
    const ratings = this._users().find((u) => u.id === userId)?.ratings ?? [];
    const count = ratings.length;
    if (!count) {
      return { reliability: 0, performance: 0, overall: 0, count: 0 };
    }
    const reliability = ratings.reduce((sum, r) => sum + r.reliability, 0) / count;
    const performance = ratings.reduce((sum, r) => sum + r.performance, 0) / count;
    return {
      reliability,
      performance,
      overall: (reliability + performance) / 2,
      count,
    };
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

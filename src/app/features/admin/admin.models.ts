/** Банковские реквизиты для переводов и вывода денег. */
export interface BankDetails {
  /** Получатель (ФИО держателя счёта). */
  recipient: string;
  /** Название банка. */
  bankName: string;
  /** Номер карты. */
  cardNumber: string;
  /** Расчётный счёт. */
  accountNumber: string;
  /** БИК банка. */
  bik: string;
}

/** Пользователь, заведённый администратором. */
export interface ManagedUser {
  id: string;
  /** Логин для входа в приложение. */
  login: string;
  /** ФИО пользователя. */
  fullName: string;
  /** Населённый пункт пользователя. */
  city: string;
  /** Активен ли пользователь (может получать назначения). */
  active: boolean;
  /** Банковские реквизиты для выплат. */
  bankDetails?: BankDetails;
}

/** Статус заявки в админ-панели. */
export type AdminOrderStatus = 'open' | 'assigned' | 'in_progress' | 'done' | 'paid';

/** Заявка (заказ), заведённая администратором. */
export interface AdminOrder {
  id: string;
  title: string;
  company: string;
  address: string;
  payout: string;
  schedule: string;
  description: string;
  status: AdminOrderStatus;
  /** id назначенного пользователя, если заявка кому-то назначена. */
  assignedUserId?: string;
}

/** Черновик новой заявки (без id и служебных полей). */
export type NewOrderDraft = Omit<AdminOrder, 'id' | 'status' | 'assignedUserId'>;

/** Черновик нового пользователя. */
export type NewUserDraft = Pick<ManagedUser, 'login' | 'fullName' | 'city'>;

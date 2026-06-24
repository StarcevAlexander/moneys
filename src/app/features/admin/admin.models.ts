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

/** Паспортные данные пользователя. */
export interface PassportData {
  series: string;
  number: string;
  issuedBy: string;
  issuedAt: string;
  birthDate: string;
  registrationAddress: string;
}

/** Загруженный файл (хранится локально как data URL). */
export interface UploadedFile {
  name: string;
  /** Содержимое в виде data URL (base64). */
  dataUrl: string;
}

/** Ключ конкретного документа пользователя. */
export type UserDocumentKey =
  | 'passportMain'
  | 'passportRegistration'
  | 'selfEmployedCertificate'
  | 'photo';

/** Документы пользователя. */
export interface UserDocuments {
  /** Фото паспорта — первая страница. */
  passportMain?: UploadedFile;
  /** Фото паспорта — страница с пропиской. */
  passportRegistration?: UploadedFile;
  /** Выписка о статусе самозанятого. */
  selfEmployedCertificate?: UploadedFile;
  /** Фото пользователя. */
  photo?: UploadedFile;
}

/** Пользователь, заведённый администратором или зарегистрированный сам. */
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
  /** Пароль (моковое локальное хранение, для входа зарегистрированных пользователей). */
  password?: string;
  /** Банковские реквизиты для выплат. */
  bankDetails?: BankDetails;
  /** Паспортные данные. */
  passport?: PassportData;
  /** Загруженные документы и фото. */
  documents?: UserDocuments;
}

/** Данные регистрации нового пользователя. */
export interface RegistrationDraft {
  login: string;
  password: string;
  fullName: string;
  city: string;
  passport: PassportData;
  bankDetails: BankDetails;
  documents: UserDocuments;
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

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

/** Статус проверки квалификационного документа менеджером. */
export type QualificationStatus = 'pending' | 'approved' | 'rejected';

/**
 * Документ дополнительного образования или допуска работника
 * (медкнижка, права на погрузчик, удостоверение стропальщика и т.п.).
 * Работник загружает фото, менеджер проверяет и вносит реквизиты.
 */
export interface QualificationDocument {
  id: string;
  /** Тип/название документа (медкнижка, права на погрузчик…). */
  title: string;
  /** Скан или фото документа (хранится локально как data URL). */
  file: UploadedFile;
  /** Статус проверки менеджером. */
  status: QualificationStatus;
  /** Серия документа (вносит менеджер при подтверждении). */
  series?: string;
  /** Номер документа. */
  number?: string;
  /** Кем выдан. */
  issuedBy?: string;
  /** Действителен с (дд.мм.гггг). */
  validFrom?: string;
  /** Действителен до (дд.мм.гггг). */
  validTo?: string;
  /** Комментарий менеджера (например, причина отклонения). */
  reviewComment?: string;
  /** Когда работник загрузил документ (ISO-строка). */
  uploadedAt: string;
  /** Когда менеджер проверил документ (ISO-строка). */
  reviewedAt?: string;
}

/** Черновик загрузки документа работником (тип + файл). */
export interface QualificationUpload {
  title: string;
  file: UploadedFile;
}

/** Данные проверки документа менеджером: реквизиты, срок и вердикт. */
export interface QualificationReviewDraft {
  status: 'approved' | 'rejected';
  series?: string;
  number?: string;
  issuedBy?: string;
  validFrom?: string;
  validTo?: string;
  reviewComment?: string;
}

/**
 * Оценка работника за конкретный выход на работу по двум показателям (шкала 1–5).
 * Надёжность — про явку на смену, исполнительность — про качество работы.
 */
export interface WorkerRating {
  id: string;
  /** id заявки, по которой выставлена оценка (если оценка привязана к заявке). */
  orderId?: string;
  /** Надёжность — выход на работу (1–5). */
  reliability: number;
  /** Исполнительность — оценка работы (1–5). */
  performance: number;
  /** Комментарий администратора. */
  comment?: string;
  /** Когда выставлена оценка (ISO-строка). */
  ratedAt: string;
}

/** Черновик новой оценки работника (без id и даты — их проставляет стор). */
export type WorkerRatingDraft = Omit<WorkerRating, 'id' | 'ratedAt'>;

/** Сводный рейтинг работника по обоим показателям (нули, если оценок нет). */
export interface WorkerRatingSummary {
  /** Средняя надёжность. */
  reliability: number;
  /** Средняя исполнительность. */
  performance: number;
  /** Общий средний балл по обоим показателям. */
  overall: number;
  /** Количество выставленных оценок. */
  count: number;
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
  /** Документы доп. образования / допусков (медкнижка, права на погрузчик и т.п.). */
  qualifications?: QualificationDocument[];
  /** История оценок работника по надёжности и исполнительности. */
  ratings?: WorkerRating[];
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
export type AdminOrderStatus = 'open' | 'assigned' | 'in_progress' | 'done' | 'paid' | 'cancelled';

/** Заявка (заказ), заведённая администратором. */
export interface AdminOrder {
  id: string;
  title: string;
  company: string;
  /** Город заявки — назначать можно только исполнителей из этого города. */
  city: string;
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

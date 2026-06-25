import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form, maxLength, minLength, required, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { PROFILE_SAVED_MESSAGE, SUPPORT_SENT_BODY } from '../../core/constants';
import { AuthService, ProfileService, ThemeService } from '../../core/services';
import { ThemeId } from '../../core/models';
import {
  AVATAR_IMAGE_MAX_SIZE,
  BANK_DETAILS_SAVED_MESSAGE,
  CITIES,
  CITY_SAVED_MESSAGE,
  EMPTY_BANK_DETAILS,
  PHOTO_SAVED_MESSAGE,
  QUALIFICATION_ADDED_MESSAGE,
  QUALIFICATION_DOC_PRESETS,
  QUALIFICATION_FILE_REQUIRED_MESSAGE,
  QUALIFICATION_OTHER,
  QUALIFICATION_REMOVED_MESSAGE,
  QUALIFICATION_STATUS_ICONS,
  QUALIFICATION_STATUS_LABELS,
  QUALIFICATION_TITLE_REQUIRED_MESSAGE,
  RATING_PERFORMANCE_HINT,
  RATING_PERFORMANCE_LABEL,
  RATING_RELIABILITY_HINT,
  RATING_RELIABILITY_LABEL,
  RATING_SCALE,
  UPLOAD_IMAGE_MAX_SIZE,
} from '../admin/admin.constants';
import { AdminStore } from '../admin/admin.store';
import { QualificationDocument, UploadedFile } from '../admin/admin.models';
import { compressImage, fileToStoredDataUrl } from '../../core/utils/image-upload';
import { ExpiryState, expiryLabel, expiryState } from '../../core/utils/expiry';

/** Страница настроек: профиль, реквизиты, тема оформления и обращение в техподдержку. */
@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    FormField,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    DecimalPipe,
  ],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly profileService = inject(ProfileService);
  private readonly themeService = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly adminStore = inject(AdminStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly location = inject(Location);

  protected readonly themes = this.themeService.options;
  protected readonly currentTheme = this.themeService.current;
  protected readonly allCities = CITIES;

  /** Запись пользователя для текущего логина — источник его реквизитов. */
  protected readonly bankUser = computed(() => {
    const login = this.auth.currentUser()?.login;
    return login ? this.adminStore.userByLogin(login) : undefined;
  });
  protected readonly hasBank = computed(() => !!this.bankUser());
  /** Текущий аватар пользователя (data URL) или undefined — тогда показываем иконку. */
  protected readonly avatar = computed(() => this.bankUser()?.documents?.photo?.dataUrl);

  // Рейтинг работника (только для просмотра — себя боец не оценивает).
  protected readonly ratingScale = RATING_SCALE;
  protected readonly reliabilityLabel = RATING_RELIABILITY_LABEL;
  protected readonly reliabilityHint = RATING_RELIABILITY_HINT;
  protected readonly performanceLabel = RATING_PERFORMANCE_LABEL;
  protected readonly performanceHint = RATING_PERFORMANCE_HINT;
  /** Сводный рейтинг текущего работника по обоим показателям. */
  protected readonly ratingSummary = computed(() => {
    const user = this.bankUser();
    return user ? this.adminStore.ratingSummary(user.id) : undefined;
  });
  /** История оценок работника — чтобы видеть, за какую работу какой балл. */
  protected readonly ratings = computed(() => this.bankUser()?.ratings ?? []);

  // Документы доп. образования / допусков (медкнижка, права на погрузчик и т.п.).
  protected readonly qualPresets = QUALIFICATION_DOC_PRESETS;
  protected readonly qualOther = QUALIFICATION_OTHER;
  protected readonly qualStatusLabels = QUALIFICATION_STATUS_LABELS;
  protected readonly qualStatusIcons = QUALIFICATION_STATUS_ICONS;
  /** Загруженные работником документы. */
  protected readonly qualifications = computed(() => this.bankUser()?.qualifications ?? []);
  /** Черновик нового документа: выбранный тип, своё название и приложенный файл. */
  protected readonly qualType = signal('');
  protected readonly qualCustomTitle = signal('');
  protected readonly qualFile = signal<UploadedFile | undefined>(undefined);

  /** Название работы, за которую выставлена оценка (пустая строка — без привязки). */
  orderTitle(orderId?: string): string {
    if (!orderId) {
      return '';
    }
    return this.adminStore.orders().find((o) => o.id === orderId)?.title ?? '';
  }

  private readonly profile = signal(this.profileService.profile());
  protected readonly profileForm = form(this.profile, (path) => {
    maxLength(path.passportSeries, 4);
    maxLength(path.passportNumber, 6);
  });

  private readonly bank = signal({ ...EMPTY_BANK_DETAILS, ...this.bankUser()?.bankDetails });
  protected readonly bankForm = form(this.bank);

  private readonly support = signal({ message: '' });
  protected readonly supportForm = form(this.support, (path) => {
    required(path.message, { message: 'Введите сообщение' });
    minLength(path.message, 10, { message: 'Минимум 10 символов' });
  });

  selectTheme(theme: ThemeId): void {
    this.themeService.setTheme(theme);
  }

  saveProfile(): void {
    this.profileService.save(this.profile());
    this.snackBar.open(PROFILE_SAVED_MESSAGE, undefined, { duration: 2500 });
  }

  async onAvatar(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const user = this.bankUser();
    if (!file || !user) {
      return;
    }
    try {
      const dataUrl = await compressImage(file, AVATAR_IMAGE_MAX_SIZE);
      this.adminStore.updatePhoto(user.id, { name: file.name, dataUrl });
      this.snackBar.open(PHOTO_SAVED_MESSAGE, undefined, { duration: 2000 });
    } catch {
      this.snackBar.open('Не удалось загрузить фото', undefined, { duration: 2500 });
    }
    input.value = '';
  }

  /** Состояние срока действия документа (для подсветки). */
  expiry(doc: QualificationDocument): ExpiryState {
    return expiryState(doc.validTo);
  }

  /** Подпись о скором/прошедшем сроке (пустая строка — подсвечивать нечего). */
  expiryLabel(doc: QualificationDocument): string {
    return expiryLabel(doc.validTo);
  }

  onQualCustomTitle(event: Event): void {
    this.qualCustomTitle.set((event.target as HTMLInputElement).value);
  }

  async onQualFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await fileToStoredDataUrl(file, UPLOAD_IMAGE_MAX_SIZE);
      this.qualFile.set({ name: file.name, dataUrl });
    } catch {
      this.snackBar.open('Не удалось загрузить файл', undefined, { duration: 2500 });
    }
    input.value = '';
  }

  addQualification(): void {
    const user = this.bankUser();
    if (!user) {
      return;
    }
    const title = (
      this.qualType() === QUALIFICATION_OTHER ? this.qualCustomTitle() : this.qualType()
    ).trim();
    const file = this.qualFile();
    if (!title) {
      this.snackBar.open(QUALIFICATION_TITLE_REQUIRED_MESSAGE, undefined, { duration: 2500 });
      return;
    }
    if (!file) {
      this.snackBar.open(QUALIFICATION_FILE_REQUIRED_MESSAGE, undefined, { duration: 2500 });
      return;
    }
    this.adminStore.addQualification(user.id, { title, file });
    this.qualType.set('');
    this.qualCustomTitle.set('');
    this.qualFile.set(undefined);
    this.snackBar.open(QUALIFICATION_ADDED_MESSAGE, undefined, { duration: 2500 });
  }

  removeQualification(docId: string): void {
    const user = this.bankUser();
    if (!user) {
      return;
    }
    this.adminStore.removeQualification(user.id, docId);
    this.snackBar.open(QUALIFICATION_REMOVED_MESSAGE, undefined, { duration: 2000 });
  }

  saveBank(): void {
    const user = this.bankUser();
    if (!user) {
      return;
    }
    this.adminStore.updateBankDetails(user.id, this.bank());
    this.snackBar.open(BANK_DETAILS_SAVED_MESSAGE, undefined, { duration: 2000 });
  }

  /** Сменить свой город. */
  setCity(city: string): void {
    const user = this.bankUser();
    if (!user) {
      return;
    }
    this.adminStore.updateCity(user.id, city);
    this.snackBar.open(CITY_SAVED_MESSAGE, undefined, { duration: 2000 });
  }

  sendSupport(): void {
    if (this.supportForm().invalid()) {
      this.supportForm.message().markAsTouched();
      return;
    }

    // Бэка нет — имитируем отправку и подтверждаем приём обращения.
    this.supportForm().reset();
    this.snackBar.open(SUPPORT_SENT_BODY, undefined, { duration: 3000 });
  }

  back(): void {
    this.location.back();
  }
}

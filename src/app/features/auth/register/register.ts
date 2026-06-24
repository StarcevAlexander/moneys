import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, minLength, required, FormField } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CITIES,
  REGISTRATION_DOCS_REQUIRED_MESSAGE,
  REGISTRATION_SUCCESS_MESSAGE,
  UPLOAD_IMAGE_MAX_SIZE,
} from '../../admin/admin.constants';
import { AdminStore } from '../../admin/admin.store';
import { RegistrationDraft, UploadedFile, UserDocumentKey } from '../../admin/admin.models';
import { AuthService } from '../../../core/services';
import { fileToStoredDataUrl } from '../../../core/utils/image-upload';

/** Регистрация пользователя: профиль, паспорт, реквизиты и загрузка документов. */
@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    FormField,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './register.scss',
})
export class Register {
  private readonly adminStore = inject(AdminStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly cities = CITIES;
  protected readonly hidePassword = signal(true);

  protected readonly passportMain = signal<UploadedFile | undefined>(undefined);
  protected readonly passportRegistration = signal<UploadedFile | undefined>(undefined);
  protected readonly selfEmployedCertificate = signal<UploadedFile | undefined>(undefined);
  protected readonly photo = signal<UploadedFile | undefined>(undefined);

  private readonly docSignals = {
    passportMain: this.passportMain,
    passportRegistration: this.passportRegistration,
    selfEmployedCertificate: this.selfEmployedCertificate,
    photo: this.photo,
  };

  private readonly model = signal({
    fullName: '',
    login: '',
    password: '',
    city: '',
    series: '',
    number: '',
    issuedBy: '',
    issuedAt: '',
    birthDate: '',
    registrationAddress: '',
    recipient: '',
    bankName: '',
    cardNumber: '',
    accountNumber: '',
    bik: '',
  });

  protected readonly form = form(this.model, (path) => {
    required(path.fullName, { message: 'Укажите ФИО' });
    required(path.login, { message: 'Укажите логин' });
    required(path.password, { message: 'Укажите пароль' });
    minLength(path.password, 4, { message: 'Минимум 4 символа' });
    required(path.city, { message: 'Укажите город' });
    required(path.series, { message: 'Серия' });
    required(path.number, { message: 'Номер' });
  });

  protected readonly docFields: { key: UserDocumentKey; label: string; accept: string }[] = [
    { key: 'passportMain', label: 'Паспорт — главная страница', accept: 'image/*' },
    { key: 'passportRegistration', label: 'Паспорт — прописка', accept: 'image/*' },
    {
      key: 'selfEmployedCertificate',
      label: 'Справка о самозанятости',
      accept: 'image/*,application/pdf',
    },
    { key: 'photo', label: 'Фото пользователя', accept: 'image/*' },
  ];

  /** Текущий загруженный файл по ключу документа. */
  doc(key: UserDocumentKey): UploadedFile | undefined {
    return this.docSignals[key]();
  }

  togglePassword(): void {
    this.hidePassword.update((v) => !v);
  }

  async onFile(event: Event, key: UserDocumentKey): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await fileToStoredDataUrl(file, UPLOAD_IMAGE_MAX_SIZE);
      this.docSignals[key].set({ name: file.name, dataUrl });
    } catch {
      this.snackBar.open('Не удалось загрузить файл', undefined, { duration: 2500 });
    }
    input.value = '';
  }

  register(): void {
    if (this.form().invalid()) {
      this.form.fullName().markAsTouched();
      this.form.login().markAsTouched();
      this.form.password().markAsTouched();
      this.form.city().markAsTouched();
      this.form.series().markAsTouched();
      this.form.number().markAsTouched();
      return;
    }

    if (
      !this.passportMain() ||
      !this.passportRegistration() ||
      !this.selfEmployedCertificate() ||
      !this.photo()
    ) {
      this.snackBar.open(REGISTRATION_DOCS_REQUIRED_MESSAGE, undefined, { duration: 3000 });
      return;
    }

    if (this.adminStore.isLoginTaken(this.model().login)) {
      this.snackBar.open('Такой логин уже занят', undefined, { duration: 2500 });
      return;
    }

    const v = this.model();
    const draft: RegistrationDraft = {
      login: v.login,
      password: v.password,
      fullName: v.fullName,
      city: v.city,
      passport: {
        series: v.series,
        number: v.number,
        issuedBy: v.issuedBy,
        issuedAt: v.issuedAt,
        birthDate: v.birthDate,
        registrationAddress: v.registrationAddress,
      },
      bankDetails: {
        recipient: v.recipient,
        bankName: v.bankName,
        cardNumber: v.cardNumber,
        accountNumber: v.accountNumber,
        bik: v.bik,
      },
      // Пока локально храним только фото пользователя; тяжёлые сканы не персистим.
      documents: {
        photo: this.photo(),
      },
    };

    this.adminStore.register(draft);
    this.auth.login({ login: v.login, password: v.password });
    this.snackBar.open(REGISTRATION_SUCCESS_MESSAGE, undefined, { duration: 2500 });
    void this.router.navigate(['/jobs']);
  }
}

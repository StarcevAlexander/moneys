import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MOCK_ADMIN_LOGIN,
  MOCK_ADMIN_PASSWORD,
  MOCK_LOGIN,
  MOCK_PASSWORD,
} from '../../../core/constants';
import { AuthService, NotificationService } from '../../../core/services';
import { InstallButton } from '../../../shared/components/install-button/install-button';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    InstallButton,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly hidePassword = signal(true);
  protected readonly error = signal(false);
  protected readonly loading = signal(false);

  // Тестовые учётки для подсказки на экране входа.
  protected readonly workerLogin = MOCK_LOGIN;
  protected readonly workerPassword = MOCK_PASSWORD;
  protected readonly adminLogin = MOCK_ADMIN_LOGIN;
  protected readonly adminPassword = MOCK_ADMIN_PASSWORD;

  protected readonly form = this.fb.nonNullable.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
  });

  togglePassword(): void {
    this.hidePassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const ok = this.auth.login(this.form.getRawValue());

    if (!ok) {
      this.error.set(true);
      this.loading.set(false);
      this.form.controls.password.reset();
      return;
    }

    if (this.auth.isAdmin()) {
      void this.router.navigate(['/admin/orders']);
      return;
    }

    // После входа работника — через 10 секунд прилетит пуш «Поступил новый заказ».
    void this.notifications.scheduleOrderNotification();
    void this.router.navigate(['/jobs']);
  }
}

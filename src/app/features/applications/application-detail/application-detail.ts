import { Component, computed, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.models';
import { ApplicationStatus } from '../applications.models';
import { STATUS_ICONS, STATUS_LABELS } from '../applications.constants';
import { ApplicationsStore } from '../applications.store';

/** Статусы, заявку в которых можно отозвать (ещё активна). */
const WITHDRAWABLE: ReadonlySet<ApplicationStatus> = new Set<ApplicationStatus>([
  'awaiting',
  'requested',
  'assigned',
]);

@Component({
  selector: 'app-application-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.scss',
})
export class ApplicationDetail {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly store = inject(ApplicationsStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  /** id заявки приходит из маршрута через withComponentInputBinding. */
  readonly id = input<string>();

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusIcons = STATUS_ICONS;

  protected readonly application = computed(() =>
    this.store.items().find((a) => a.id === this.id()),
  );

  protected readonly canWithdraw = computed(() => {
    const app = this.application();
    return !!app && WITHDRAWABLE.has(app.status);
  });

  /** Если заявка — отклик на вакансию (id вида resp-<jobId>), даём ссылку на вакансию. */
  protected readonly jobId = computed(() => {
    const id = this.id();
    return id?.startsWith('resp-') ? id.slice('resp-'.length) : undefined;
  });

  withdraw(): void {
    const id = this.id();
    if (!id || !this.canWithdraw()) {
      return;
    }

    const data: ConfirmDialogData = {
      title: 'Отозвать заявку?',
      message: 'Заявка будет удалена из списка. Это действие нельзя отменить.',
      confirmText: 'Отозвать',
      cancelText: 'Отмена',
      danger: true,
    };

    this.dialog
      .open(ConfirmDialog, { data, width: '320px', autoFocus: false })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.store.withdraw(id);
        this.snackBar.open('Заявка отозвана', 'OK', { duration: 4000 });
        void this.router.navigate(['/applications']);
      });
  }

  back(): void {
    this.location.back();
  }
}

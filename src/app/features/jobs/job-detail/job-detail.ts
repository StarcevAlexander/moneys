import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationsStore } from '../../applications/applications.store';
import { JOB_POINTS } from '../jobs.data';

@Component({
  selector: 'app-job-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './job-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './job-detail.scss',
})
export class JobDetail {
  private readonly location = inject(Location);
  private readonly store = inject(ApplicationsStore);
  private readonly snackBar = inject(MatSnackBar);

  /** id задачи приходит из маршрута через withComponentInputBinding. */
  readonly id = input<string>();

  protected readonly job = computed(() => JOB_POINTS.find((j) => j.id === this.id()));
  protected readonly responded = computed(() => {
    const id = this.id();
    return id ? this.store.hasResponded(id) : false;
  });

  respond(): void {
    const job = this.job();
    if (!job || this.responded()) {
      return;
    }
    this.store.respond(job);
    this.snackBar.open('Вы откликнулись, ждите уведомления в приложении', 'OK', {
      duration: 5000,
    });
  }

  back(): void {
    this.location.back();
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatCalendar } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { STATUS_ICONS, STATUS_LABELS } from './applications.constants';
import { ApplicationsStore } from './applications.store';
import { JobApplication } from './applications.models';

@Component({
  selector: 'app-applications',
  imports: [DatePipe, RouterLink, MatCardModule, MatCalendar, MatIconModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications {
  private readonly store = inject(ApplicationsStore);

  protected readonly applications = this.store.items;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusIcons = STATUS_ICONS;
  protected readonly selectedDate = signal(new Date(2026, 5, 23));

  private readonly busyDates = computed(() => new Set(this.applications().map((a) => a.isoDate)));

  /** Подсветка дней, на которые есть заявки. */
  readonly dateClass = (date: Date): string => {
    return this.busyDates().has(this.toIso(date)) ? 'cal-busy' : '';
  };

  onSelect(date: Date | null): void {
    if (date) {
      this.selectedDate.set(date);
    }
  }

  applicationsOn(date: Date): JobApplication[] {
    const iso = this.toIso(date);
    return this.applications().filter((a) => a.isoDate === iso);
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

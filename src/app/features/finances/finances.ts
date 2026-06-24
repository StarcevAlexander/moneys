import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import type { EChartsCoreOption } from 'echarts/core';
import { Chart } from '../../shared/components/chart/chart';
import { INCOME_CHART_PALETTE, PERIOD_LABELS } from './finances.constants';
import { INCOME_BY_PERIOD, PAYMENTS, SUMMARY_CARDS } from './finances.data';
import { IncomePeriod, IncomeSlice } from './finances.models';

@Component({
  selector: 'app-finances',
  imports: [DecimalPipe, MatButtonToggleModule, MatIconModule, Chart],
  templateUrl: './finances.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './finances.scss',
})
export class Finances {
  protected readonly summary = SUMMARY_CARDS;
  protected readonly pendingPayments = PAYMENTS.filter((p) => p.status === 'pending');
  protected readonly paidPayments = PAYMENTS.filter((p) => p.status === 'paid');

  protected readonly period = signal<IncomePeriod>('month');
  private readonly periodData = computed(() => INCOME_BY_PERIOD[this.period()]);
  protected readonly periodTotal = computed(() => this.periodData().total);
  protected readonly periodLabel = computed(() => PERIOD_LABELS[this.period()]);
  protected readonly chartOption = computed<EChartsCoreOption>(() =>
    this.buildChartOption(this.periodData().slices),
  );

  setPeriod(period: IncomePeriod): void {
    this.period.set(period);
  }

  private buildChartOption(slices: IncomeSlice[]): EChartsCoreOption {
    return {
      color: INCOME_CHART_PALETTE,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ₽ {c} ({d}%)',
        // Не даём подсказке вылезать за пределы контейнера (важно на мобилке).
        confine: true,
      },
      legend: {
        bottom: 8,
        icon: 'circle',
        itemGap: 10,
        itemWidth: 12,
        itemHeight: 12,
        padding: [0, 8],
        textStyle: { color: '#c7d2cb', fontSize: 12 },
      },
      series: [
        {
          name: 'Доход',
          type: 'pie',
          // Пирог смещён вверх и уменьшен, чтобы не наплывать на легенду на узких экранах.
          radius: ['40%', '60%'],
          center: ['50%', '36%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: '#03150e',
            borderWidth: 2,
            borderRadius: 6,
          },
          label: { show: false },
          labelLine: { show: false },
          data: slices.map((slice) => ({ name: slice.name, value: slice.value })),
        },
      ],
    };
  }
}

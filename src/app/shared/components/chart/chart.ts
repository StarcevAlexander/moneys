import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  OnDestroy,
  input,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';

// Tree-shakable регистрация: тянем только то, что реально нужно для круговой диаграммы.
echarts.use([PieChart, TooltipComponent, LegendComponent, LabelLayout, CanvasRenderer]);

/** Переиспользуемая обёртка ECharts: рисует график по [option], сама ресайзится и чистится. */
@Component({
  selector: 'app-chart',
  templateUrl: './chart.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chart.scss',
})
export class Chart implements OnDestroy {
  readonly option = input.required<EChartsCoreOption>();

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');

  private chart?: EChartsType;
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      this.chart = echarts.init(this.host().nativeElement, undefined, { renderer: 'canvas' });
      this.chart.setOption(this.option());

      this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
      this.resizeObserver.observe(this.host().nativeElement);
    });

    // Обновляем график при смене option (после первичной отрисовки).
    effect(() => {
      const option = this.option();
      this.chart?.setOption(option);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }
}

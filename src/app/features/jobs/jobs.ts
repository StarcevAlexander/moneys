import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IRKUTSK_CENTER, MAP_DEFAULT_ZOOM } from '../../core/constants';
import { YandexMapsService, YMaps3 } from '../../core/services';
import { JOB_POINTS } from './jobs.data';
import { JobPoint } from './jobs.models';

@Component({
  selector: 'app-jobs',
  imports: [RouterLink, MatIconModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs {
  private readonly maps = inject(YandexMapsService);
  private readonly router = inject(Router);
  private readonly mapHost = viewChild<ElementRef<HTMLDivElement>>('map');

  protected readonly jobs = JOB_POINTS;
  protected readonly hasApiKey = this.maps.hasApiKey;
  protected readonly mapLoading = signal(this.maps.hasApiKey);
  protected readonly mapError = signal(false);

  // Динамические объекты Яндекс.Карт v3 — публичных типов у API нет.
  private ymaps3?: YMaps3;
  private map?: {
    addChild: (child: unknown) => void;
    removeChild: (child: unknown) => void;
    setLocation: (options: unknown) => void;
  };
  private popupMarker?: unknown;

  constructor() {
    afterNextRender(() => {
      if (this.maps.hasApiKey) {
        void this.initMap();
      }
    });
  }

  openDetail(job: JobPoint): void {
    void this.router.navigate(['/jobs', job.id]);
  }

  private async initMap(): Promise<void> {
    const host = this.mapHost()?.nativeElement;
    if (!host) {
      return;
    }

    try {
      const ymaps3 = await this.maps.load();
      this.ymaps3 = ymaps3;
      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;

      const map = new YMap(host, {
        location: { center: IRKUTSK_CENTER, zoom: MAP_DEFAULT_ZOOM },
      });
      map.addChild(new YMapDefaultSchemeLayer());
      map.addChild(new YMapDefaultFeaturesLayer());

      for (const job of this.jobs) {
        map.addChild(new YMapMarker({ coordinates: job.coordinates }, this.createPin(job)));
      }

      this.map = map;
      this.mapLoading.set(false);
    } catch {
      this.mapError.set(true);
      this.mapLoading.set(false);
    }
  }

  /** Открывает балун над точкой и центрирует карту на ней. */
  private openPopup(job: JobPoint): void {
    if (!this.map || !this.ymaps3) {
      return;
    }
    this.closePopup();
    this.map.setLocation({ center: job.coordinates, zoom: 14, duration: 300 });
    const YMapMarker = this.ymaps3['YMapMarker'];
    this.popupMarker = new YMapMarker(
      { coordinates: job.coordinates, zIndex: 1000 },
      this.createPopup(job),
    );
    this.map.addChild(this.popupMarker);
  }

  private closePopup(): void {
    if (this.popupMarker && this.map) {
      this.map.removeChild(this.popupMarker);
      this.popupMarker = undefined;
    }
  }

  /** DOM-маркер «монетка» для точки. */
  private createPin(job: JobPoint): HTMLElement {
    const pin = document.createElement('div');
    pin.textContent = '₽';
    pin.setAttribute('role', 'button');
    pin.setAttribute('aria-label', job.title);
    pin.style.cssText = [
      'display:grid',
      'place-items:center',
      'width:32px',
      'height:32px',
      'border-radius:50%',
      'transform:translate(-50%,-50%)',
      'background:radial-gradient(circle at 36% 30%,#fff6cf,#ffd24d 34%,#e8a83a 70%,#b6781e)',
      'color:#6b4310',
      'font:700 16px Georgia,serif',
      'box-shadow:0 3px 8px rgba(0,0,0,.45)',
      'border:2px solid #fff6cf',
      'cursor:pointer',
    ].join(';');
    pin.addEventListener('click', () => this.openPopup(job));
    return pin;
  }

  /** Балун с краткой инфой и кнопкой «Подробнее». */
  private createPopup(job: JobPoint): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = [
      'position:relative',
      'transform:translate(-50%,calc(-100% - 22px))',
      'width:236px',
      'padding:12px 14px',
      'border-radius:14px',
      'background:#0b2a1d',
      'border:1px solid rgba(255,246,207,.18)',
      'box-shadow:0 12px 30px rgba(0,0,0,.55)',
      'color:#f4f6f3',
      "font:400 13px Roboto,'Segoe UI',sans-serif",
    ].join(';');

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Закрыть');
    close.style.cssText =
      'position:absolute;top:4px;right:8px;border:0;background:transparent;color:#9fb0a7;font-size:20px;line-height:1;cursor:pointer';
    close.addEventListener('click', () => this.closePopup());

    const title = document.createElement('div');
    title.textContent = job.title;
    title.style.cssText = 'font-weight:700;font-size:14px;margin:0 18px 6px 0';

    const meta = document.createElement('div');
    meta.style.cssText =
      'display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#c7d2cb;font-size:12px';
    const date = document.createElement('span');
    date.textContent = job.schedule;
    const price = document.createElement('span');
    price.textContent = job.payout;
    price.style.cssText = 'color:#3ddc84;font-weight:700;white-space:nowrap';
    meta.append(date, price);

    const short = document.createElement('p');
    short.textContent = job.short;
    short.style.cssText = 'margin:0 0 10px;color:#dfe7e2;font-size:12px;line-height:1.4';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Подробнее';
    button.style.cssText =
      'width:100%;padding:8px;border:0;border-radius:10px;background:#ffd24d;color:#3a2a06;font-weight:700;font-size:13px;cursor:pointer';
    button.addEventListener('click', () => this.openDetail(job));

    const tip = document.createElement('div');
    tip.style.cssText =
      'position:absolute;bottom:-7px;left:50%;transform:translateX(-50%) rotate(45deg);width:14px;height:14px;background:#0b2a1d;border-right:1px solid rgba(255,246,207,.18);border-bottom:1px solid rgba(255,246,207,.18)';

    card.append(close, title, meta, short, button, tip);
    return card;
  }
}

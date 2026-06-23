import { Injectable } from '@angular/core';
import { YANDEX_MAPS_API_KEY } from '../constants';

declare global {
  interface Window {
    // Глобал, который кладёт скрипт Яндекс.Карт v3.
    ymaps3?: YMaps3;
  }
}

/** Минимально нужный нам контракт глобала ymaps3 (полных типов у API нет). */
export interface YMaps3 {
  ready: Promise<void>;
  // У Яндекс.Карт v3 нет публичных типов — конструкторы карты приходят динамически.
  [key: string]: any;
}

/** Ленивая подгрузка Яндекс.Карт v3. Грузим скрипт только когда реально нужна карта. */
@Injectable({ providedIn: 'root' })
export class YandexMapsService {
  private loadPromise?: Promise<YMaps3>;

  /** Ключ задан — карту можно показывать. */
  get hasApiKey(): boolean {
    return YANDEX_MAPS_API_KEY.length > 0;
  }

  load(): Promise<YMaps3> {
    if (!this.hasApiKey) {
      return Promise.reject(new Error('Не задан YANDEX_MAPS_API_KEY'));
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<YMaps3>((resolve, reject) => {
      if (window.ymaps3) {
        void window.ymaps3.ready.then(() => resolve(window.ymaps3 as YMaps3));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        const api = window.ymaps3;
        if (!api) {
          reject(new Error('ymaps3 не инициализировался'));
          return;
        }
        void api.ready.then(() => resolve(api));
      };
      script.onerror = () => reject(new Error('Не удалось загрузить Яндекс.Карты'));
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}

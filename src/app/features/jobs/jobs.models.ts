export interface JobPoint {
  id: string;
  title: string;
  company: string;
  /** Город точки — совпадает со значением из списка CITIES. */
  city: string;
  /** Координаты в формате Яндекс.Карт v3 — [долгота, широта]. */
  coordinates: [number, number];
  address: string;
  payout: string;
  schedule: string;
  /** Короткое описание для балуна на карте. */
  short: string;
  /** Полное описание для страницы задачи. */
  description: string;
}

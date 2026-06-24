/** Утилиты загрузки и сжатия изображений для локального хранения (data URL). */

/** Читает файл как data URL без изменений. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Сжимает изображение до maxSize по большей стороне и возвращает JPEG data URL. */
export function compressImage(file: File, maxSize: number, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('no 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load error'));
    };
    img.src = url;
  });
}

/** Изображения сжимаем, прочие файлы читаем как есть. */
export function fileToStoredDataUrl(file: File, maxSize: number): Promise<string> {
  return file.type.startsWith('image/') ? compressImage(file, maxSize) : readFileAsDataUrl(file);
}

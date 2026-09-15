export const MAX_EDGE = 1600;
export const JPEG_QUALITY = 0.8;

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('無法讀取圖片檔'));
    };
    img.src = url;
  });
}

/** Scales the image so its long edge is at most MAX_EDGE px and re-encodes as JPEG. */
export async function compressImage(file: Blob, maxEdge = MAX_EDGE, quality = JPEG_QUALITY): Promise<CompressedImage> {
  const img = await loadImage(file);
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('瀏覽器不支援 canvas');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('圖片壓縮失敗');
  return { blob, width, height };
}

/** Builds a unique repo file name: <timestamp>-<slug>.jpg */
export function imageFileName(originalName: string, now = Date.now()): string {
  const base = originalName.replace(/\.[^.]+$/, '');
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'photo';
  return `${now}-${slug}.jpg`;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('讀取圖片失敗'));
    reader.readAsDataURL(blob);
  });
}

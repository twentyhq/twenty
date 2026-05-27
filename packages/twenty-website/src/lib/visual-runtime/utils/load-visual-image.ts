type LoadVisualImageOptions = {
  crossOrigin?: HTMLImageElement['crossOrigin'];
  label?: string;
};

const visualImageCache = new Map<string, Promise<HTMLImageElement>>();

function getVisualImageCacheKey(
  imageUrl: string,
  crossOrigin: HTMLImageElement['crossOrigin'] | undefined,
) {
  return JSON.stringify({ crossOrigin: crossOrigin ?? null, imageUrl });
}

function createVisualImageLoadError(imageUrl: string, label: string) {
  return new Error(`Failed to load ${label}: ${imageUrl}`);
}

async function settleImageDecode(image: HTMLImageElement) {
  if (typeof image.decode !== 'function') {
    return;
  }

  try {
    await image.decode();
  } catch {
    // Some engines reject decode() after a successful load for progressive or
    // cached images. The loaded element is still usable as a WebGL texture.
  }
}

export function loadVisualImage(
  imageUrl: string,
  { crossOrigin, label = 'visual image' }: LoadVisualImageOptions = {},
) {
  const cacheKey = getVisualImageCacheKey(imageUrl, crossOrigin);
  const cachedImage = visualImageCache.get(cacheKey);

  if (cachedImage) {
    return cachedImage;
  }

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';

    if (typeof crossOrigin !== 'undefined') {
      image.crossOrigin = crossOrigin;
    }

    image.onload = () => {
      void settleImageDecode(image).then(() => resolve(image));
    };
    image.onerror = () => {
      reject(createVisualImageLoadError(imageUrl, label));
    };
    image.src = imageUrl;
  }).catch((error: unknown) => {
    visualImageCache.delete(cacheKey);
    throw error;
  });

  visualImageCache.set(cacheKey, imagePromise);

  return imagePromise;
}

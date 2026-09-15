type LoadVisualImageOptions = {
  crossOrigin?: HTMLImageElement['crossOrigin'];
  label?: string;
};

const visualImageCache = new Map<string, Promise<HTMLImageElement>>();

async function settleImageDecode(image: HTMLImageElement) {
  if (typeof image.decode !== 'function') {
    return;
  }
  try {
    await image.decode();
  } catch {
    // Some engines reject decode() after a successful load for progressive
    // or cached images; the element is still usable as a WebGL texture.
  }
}

// Cached image loader; a failed load evicts its cache entry so the next
// request retries instead of replaying the rejection forever.
export function loadVisualImage(
  imageUrl: string,
  { crossOrigin, label = 'visual image' }: LoadVisualImageOptions = {},
): Promise<HTMLImageElement> {
  const cacheKey = JSON.stringify({
    crossOrigin: crossOrigin ?? null,
    imageUrl,
  });
  const cachedImage = visualImageCache.get(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    if (crossOrigin !== undefined) {
      image.crossOrigin = crossOrigin;
    }
    image.addEventListener('load', () => {
      void settleImageDecode(image).then(() => resolve(image));
    });
    image.addEventListener('error', () => {
      reject(new Error(`Failed to load ${label}: ${imageUrl}`));
    });
    image.src = imageUrl;
  }).catch((error: unknown) => {
    visualImageCache.delete(cacheKey);
    throw error;
  });

  visualImageCache.set(cacheKey, imagePromise);
  return imagePromise;
}

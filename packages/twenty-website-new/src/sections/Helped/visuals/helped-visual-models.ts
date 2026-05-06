import { loadImportedGeometryFromUrl } from '@/lib/halftone';

export const HELPED_VISUAL_MODEL_URLS = {
  money: '/illustrations/home/helped/money.glb',
  spaceship: '/illustrations/home/helped/spaceship.glb',
  target: '/illustrations/home/helped/target.glb',
} as const;

let preloadPromise: Promise<void> | null = null;

export function preloadHelpedVisualGeometries() {
  preloadPromise ??= (async () => {
    const geometries = await Promise.all(
      Object.entries(HELPED_VISUAL_MODEL_URLS).map(([label, modelUrl]) =>
        loadImportedGeometryFromUrl('glb', modelUrl, `${label}.glb`),
      ),
    );

    geometries.forEach((geometry) => geometry.dispose());
  })().catch((error: unknown) => {
    preloadPromise = null;

    if (process.env.NODE_ENV !== 'production') {
      console.error('Helped visual geometry preload failed:', error);
    }
  });

  return preloadPromise;
}

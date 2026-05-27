import { loadImportedGeometryFromUrl } from '@/lib/halftone';

import { HELPED_VISUAL_MODEL_URLS } from '../constants/helped-visual-model-urls';

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

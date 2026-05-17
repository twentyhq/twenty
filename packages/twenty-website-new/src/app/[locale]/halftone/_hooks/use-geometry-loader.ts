import {
  createFallbackGeometry,
  disposeGeometryCache,
  getGeometryForSpec,
} from '@/lib/halftone/utils/geometry-registry';
import type { HalftoneGeometrySpec } from '@/lib/halftone/utils/state';
import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';

type GeometryCacheEntry = THREE.BufferGeometry | Promise<THREE.BufferGeometry>;

type GeometryLoaderCallbacks = {
  onLoadStart: (label: string) => void;
  onLoadSuccess: () => void;
  onLoadError: (message: string) => void;
  onFallbackShape: (key: string) => void;
};

export function useGeometryLoader(
  selectedShape: HalftoneGeometrySpec | undefined,
  importedFiles: Record<string, File | undefined>,
  callbacks: GeometryLoaderCallbacks,
) {
  const [activeGeometry, setActiveGeometry] = useState<THREE.BufferGeometry>(
    () => createFallbackGeometry(),
  );
  const geometryCacheReference = useRef<Map<string, GeometryCacheEntry>>(
    new Map([['torusKnot', activeGeometry]]),
  );
  const lastSuccessfulShapeReference = useRef(
    selectedShape?.key ?? 'torusKnot',
  );

  useEffect(() => {
    const geometryCache = geometryCacheReference.current;

    return () => {
      disposeGeometryCache(geometryCache);
    };
  }, []);

  useEffect(() => {
    if (!selectedShape) {
      return;
    }

    let cancelled = false;
    const geometryCache = geometryCacheReference.current;

    // Invalidate cached geometry when an imported file changes so we don't
    // serve stale geometry from a previous file under the same key.
    if (selectedShape.kind === 'imported') {
      geometryCache.delete(selectedShape.key);
      callbacks.onLoadStart(selectedShape.label);
    } else {
      callbacks.onLoadSuccess();
    }

    void getGeometryForSpec(
      selectedShape,
      importedFiles[selectedShape.key],
      geometryCache,
    )
      .then((geometry) => {
        if (cancelled) {
          return;
        }

        lastSuccessfulShapeReference.current = selectedShape.key;
        setActiveGeometry(geometry);
        callbacks.onLoadSuccess();
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(error);

        callbacks.onLoadError(
          error instanceof Error
            ? error.message
            : `${selectedShape.label} failed to load.`,
        );

        if (lastSuccessfulShapeReference.current !== selectedShape.key) {
          callbacks.onFallbackShape(lastSuccessfulShapeReference.current);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedShape, importedFiles, callbacks]);

  return activeGeometry;
}

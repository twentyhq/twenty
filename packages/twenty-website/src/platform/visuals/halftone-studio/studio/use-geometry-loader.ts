'use client';

import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';

import { HALFTONE_GEOMETRY_CACHE } from '../engine/geometry-cache';
import type { HalftoneGeometrySpec } from '../engine/studio-settings-types';

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
    () => HALFTONE_GEOMETRY_CACHE.createFallback(),
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
      HALFTONE_GEOMETRY_CACHE.dispose(geometryCache);
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

    void HALFTONE_GEOMETRY_CACHE.getForSpec(
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

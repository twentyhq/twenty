'use client';

import { useLatestRef } from '@/lib/react';
import {
  type MutableRefObject,
  type RefObject,
  useEffect,
  useState,
} from 'react';
import type * as THREE from 'three';

import {
  createFallbackGeometry,
  loadImportedGeometryFromUrl,
  type ImportedGeometryNormalizationOptions,
} from '../utils/geometry-registry';
import {
  HalftoneCanvas,
  type HalftoneRenderStrategy,
  type HalftoneSnapshotFn,
} from './HalftoneCanvas';
import type {
  HalftoneExportPose,
  HalftoneModelLoader,
  HalftoneStudioSettings,
} from '../utils/state';

type HalftoneModelCanvasProps = {
  geometryOptions?: ImportedGeometryNormalizationOptions;
  initialPose?: Partial<HalftoneExportPose>;
  loader?: HalftoneModelLoader;
  modelLabel?: string;
  modelUrl: string;
  onFirstInteraction?: () => void;
  onGeometryLoadError?: (error: Error) => void;
  onPoseChange?: (pose: HalftoneExportPose) => void;
  previewDistance: number;
  renderStrategy?: HalftoneRenderStrategy;
  settings: HalftoneStudioSettings;
  snapshotRef?: MutableRefObject<HalftoneSnapshotFn | null>;
  virtualRenderHeight?: number;
};

const noopFirstInteraction = () => {};
const noopPoseChange = (_pose: HalftoneExportPose) => {};

function toGeometryLoadError(error: unknown, modelUrl: string) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(`Halftone model failed to load: ${modelUrl}`);
}

function useModelGeometry({
  geometryOptions,
  loader,
  modelLabel,
  modelUrl,
  onGeometryLoadErrorReference,
}: {
  geometryOptions: ImportedGeometryNormalizationOptions | undefined;
  loader: HalftoneModelLoader;
  modelLabel: string;
  modelUrl: string;
  onGeometryLoadErrorReference: RefObject<((error: Error) => void) | undefined>;
}) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadedGeometry: THREE.BufferGeometry | null = null;

    setGeometry(null);

    void loadImportedGeometryFromUrl(
      loader,
      modelUrl,
      modelLabel,
      geometryOptions,
    )
      .catch((error: unknown) => {
        const normalizedError = toGeometryLoadError(error, modelUrl);
        const handler = onGeometryLoadErrorReference.current;

        if (handler) {
          handler(normalizedError);
        } else if (process.env.NODE_ENV !== 'production') {
          console.error(normalizedError);
        }

        return createFallbackGeometry();
      })
      .then((nextGeometry) => {
        if (cancelled) {
          nextGeometry.dispose();
          return;
        }

        loadedGeometry = nextGeometry;
        setGeometry(nextGeometry);
      });

    return () => {
      cancelled = true;
      loadedGeometry?.dispose();
    };
  }, [
    geometryOptions,
    loader,
    modelLabel,
    modelUrl,
    onGeometryLoadErrorReference,
  ]);

  return geometry;
}

export function HalftoneModelCanvas({
  geometryOptions,
  initialPose,
  loader = 'glb',
  modelLabel,
  modelUrl,
  onFirstInteraction = noopFirstInteraction,
  onGeometryLoadError,
  onPoseChange = noopPoseChange,
  previewDistance,
  renderStrategy,
  settings,
  snapshotRef,
  virtualRenderHeight,
}: HalftoneModelCanvasProps) {
  const geometryLoadErrorReference = useLatestRef(onGeometryLoadError);
  const geometry = useModelGeometry({
    geometryOptions,
    loader,
    modelLabel: modelLabel ?? modelUrl.split('/').pop() ?? 'halftone model',
    modelUrl,
    onGeometryLoadErrorReference: geometryLoadErrorReference,
  });

  if (!geometry) {
    return null;
  }

  return (
    <HalftoneCanvas
      geometry={geometry}
      imageElement={null}
      initialPose={initialPose}
      onFirstInteraction={onFirstInteraction}
      onPoseChange={onPoseChange}
      previewDistance={previewDistance}
      renderStrategy={renderStrategy}
      settings={settings}
      snapshotRef={snapshotRef}
      virtualRenderHeight={virtualRenderHeight}
    />
  );
}

'use client';

import { useLatestRef } from '@/lib/react';
import {
  type MutableRefObject,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';

import {
  HalftoneCanvas,
  type HalftoneImageInteractionSettings,
  type HalftoneSnapshotFn,
} from './halftone-canvas';
import type { HalftoneExportPose, HalftoneStudioSettings } from './state';
import type { HalftoneImageFit } from './footprint';

type HalftoneImageCanvasProps = {
  crossOrigin?: HTMLImageElement['crossOrigin'];
  imageFit?: HalftoneImageFit;
  imageInteraction?: Partial<HalftoneImageInteractionSettings>;
  imageUrl: string;
  initialPose?: Partial<HalftoneExportPose>;
  onFirstInteraction?: () => void;
  onImageLoadError?: (error: Error) => void;
  onPoseChange?: (pose: HalftoneExportPose) => void;
  previewDistance: number;
  settings: HalftoneStudioSettings;
  snapshotRef?: MutableRefObject<HalftoneSnapshotFn | null>;
  virtualRenderHeight?: number;
};

const noopFirstInteraction = () => {};
const noopPoseChange = (_pose: HalftoneExportPose) => {};

function createImageLoadError(imageUrl: string) {
  return new Error(`Halftone image failed to load: ${imageUrl}`);
}

function usePlaneGeometry() {
  const geometryReference = useRef<THREE.PlaneGeometry | null>(null);

  if (geometryReference.current === null) {
    geometryReference.current = new THREE.PlaneGeometry(1, 1);
  }

  useEffect(() => {
    const geometry = geometryReference.current;

    return () => {
      geometry?.dispose();
      geometryReference.current = null;
    };
  }, []);

  return geometryReference.current;
}

function useImageElement({
  crossOrigin,
  imageUrl,
  onImageLoadErrorReference,
}: {
  crossOrigin: HTMLImageElement['crossOrigin'] | undefined;
  imageUrl: string;
  onImageLoadErrorReference: RefObject<((error: Error) => void) | undefined>;
}) {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const image = new Image();

    setImageElement(null);

    if (typeof crossOrigin !== 'undefined') {
      image.crossOrigin = crossOrigin;
    }

    image.decoding = 'async';
    image.onload = () => {
      if (!cancelled) {
        setImageElement(image);
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        const handler = onImageLoadErrorReference.current;
        const error = createImageLoadError(imageUrl);

        if (handler) {
          handler(error);
          return;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.error(error);
        }
      }
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
      image.src = '';
    };
  }, [crossOrigin, imageUrl, onImageLoadErrorReference]);

  return imageElement;
}

export function HalftoneImageCanvas({
  crossOrigin,
  imageFit,
  imageInteraction,
  imageUrl,
  initialPose,
  onFirstInteraction = noopFirstInteraction,
  onImageLoadError,
  onPoseChange = noopPoseChange,
  previewDistance,
  settings,
  snapshotRef,
  virtualRenderHeight,
}: HalftoneImageCanvasProps) {
  const imageLoadErrorReference = useLatestRef(onImageLoadError);
  const imageElement = useImageElement({
    crossOrigin,
    imageUrl,
    onImageLoadErrorReference: imageLoadErrorReference,
  });
  const geometry = usePlaneGeometry();

  if (!imageElement || !geometry) {
    return null;
  }

  return (
    <HalftoneCanvas
      geometry={geometry}
      imageElement={imageElement}
      imageFit={imageFit}
      imageInteraction={imageInteraction}
      initialPose={initialPose}
      onFirstInteraction={onFirstInteraction}
      onPoseChange={onPoseChange}
      previewDistance={previewDistance}
      settings={settings}
      snapshotRef={snapshotRef}
      virtualRenderHeight={virtualRenderHeight}
    />
  );
}

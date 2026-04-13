import type { HalftoneSourceMode } from '@/app/halftone/_lib/state';

export const DEFAULT_PREVIEW_DISTANCE = 6;
export const DEFAULT_SHAPE_PREVIEW_DISTANCE = DEFAULT_PREVIEW_DISTANCE;
export const DEFAULT_IMAGE_PREVIEW_DISTANCE = DEFAULT_PREVIEW_DISTANCE;

export function createPreviewDistanceBySourceMode(
  sourceMode: HalftoneSourceMode,
  previewDistance: number,
) {
  return {
    shape:
      sourceMode === 'shape'
        ? previewDistance
        : DEFAULT_SHAPE_PREVIEW_DISTANCE,
    image:
      sourceMode === 'image' ? previewDistance : DEFAULT_IMAGE_PREVIEW_DISTANCE,
  };
}

export function switchPreviewDistanceSourceMode({
  currentMode,
  currentPreviewDistance,
  nextMode,
  previewDistanceBySourceMode,
}: {
  currentMode: HalftoneSourceMode;
  currentPreviewDistance: number;
  nextMode: HalftoneSourceMode;
  previewDistanceBySourceMode: Record<HalftoneSourceMode, number>;
}) {
  const nextPreviewDistanceBySourceMode = {
    ...previewDistanceBySourceMode,
    [currentMode]: currentPreviewDistance,
  };

  return {
    nextPreviewDistance: nextPreviewDistanceBySourceMode[nextMode],
    nextPreviewDistanceBySourceMode,
  };
}

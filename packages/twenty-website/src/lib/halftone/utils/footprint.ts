import * as THREE from 'three';

export interface HalftoneRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

export type HalftoneImageFit = 'contain' | 'cover';

export interface ImageFootprintScaleArgs {
  imageFit?: HalftoneImageFit;
  imageHeight: number;
  imageWidth: number;
  previewDistance: number;
  viewportHeight: number;
  viewportWidth: number;
}

export interface ProjectedBoundsArgs {
  camera: THREE.PerspectiveCamera;
  localBounds: THREE.Box3;
  meshMatrixWorld: THREE.Matrix4;
  viewportHeight: number;
  viewportWidth: number;
}

export interface MeshFootprintScaleArgs extends ProjectedBoundsArgs {
  lookAtTarget: THREE.Vector3;
}

export const VIRTUAL_RENDER_HEIGHT = 768;
export const REFERENCE_PREVIEW_DISTANCE = 4;

export const MIN_FOOTPRINT_SCALE = 0.001;

function clampRectToViewport(
  rect: HalftoneRect,
  viewportWidth: number,
  viewportHeight: number,
) {
  const minX = Math.max(rect.x, 0);
  const minY = Math.max(rect.y, 0);
  const maxX = Math.min(rect.x + rect.width, viewportWidth);
  const maxY = Math.min(rect.y + rect.height, viewportHeight);

  if (maxX <= minX || maxY <= minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getRectArea(rect: HalftoneRect | null) {
  if (!rect) {
    return 0;
  }

  return Math.max(rect.width, 0) * Math.max(rect.height, 0);
}

function createBox3Corners(bounds: THREE.Box3) {
  const { min, max } = bounds;

  return [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];
}

export function getImagePreviewZoom(previewDistance: number) {
  return REFERENCE_PREVIEW_DISTANCE / Math.max(previewDistance, 0.001);
}

export function getContainedImageRect({
  imageFit = 'contain',
  imageHeight,
  imageWidth,
  viewportHeight,
  viewportWidth,
  zoom,
}: {
  imageFit?: HalftoneImageFit;
  imageHeight: number;
  imageWidth: number;
  viewportHeight: number;
  viewportWidth: number;
  zoom: number;
}) {
  if (
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return null;
  }

  const imageAspect = imageWidth / imageHeight;
  const viewAspect = viewportWidth / viewportHeight;

  let fittedWidth = viewportWidth;
  let fittedHeight = viewportHeight;

  if (imageAspect > viewAspect) {
    if (imageFit === 'cover') {
      fittedWidth = viewportHeight * imageAspect;
    } else {
      fittedHeight = viewportWidth / imageAspect;
    }
  } else {
    if (imageFit === 'cover') {
      fittedHeight = viewportWidth / imageAspect;
    } else {
      fittedWidth = viewportHeight * imageAspect;
    }
  }

  const scaledWidth = fittedWidth * zoom;
  const scaledHeight = fittedHeight * zoom;

  return clampRectToViewport(
    {
      x: (viewportWidth - scaledWidth) * 0.5,
      y: (viewportHeight - scaledHeight) * 0.5,
      width: scaledWidth,
      height: scaledHeight,
    },
    viewportWidth,
    viewportHeight,
  );
}

export function getFootprintScaleFromRects(
  currentRect: HalftoneRect | null,
  referenceRect: HalftoneRect | null,
) {
  const currentArea = getRectArea(currentRect);
  const referenceArea = getRectArea(referenceRect);

  if (currentArea <= 0 || referenceArea <= 0) {
    return 1;
  }

  return Math.max(Math.sqrt(currentArea / referenceArea), MIN_FOOTPRINT_SCALE);
}

export function getImageFootprintScale({
  imageFit = 'contain',
  imageHeight,
  imageWidth,
  previewDistance,
  viewportHeight,
  viewportWidth,
}: ImageFootprintScaleArgs) {
  const currentRect = getContainedImageRect({
    imageFit,
    imageHeight,
    imageWidth,
    viewportHeight,
    viewportWidth,
    zoom: getImagePreviewZoom(previewDistance),
  });
  const referenceRect = getContainedImageRect({
    imageFit,
    imageHeight,
    imageWidth,
    viewportHeight,
    viewportWidth,
    zoom: 1,
  });

  return getFootprintScaleFromRects(currentRect, referenceRect);
}

export function projectBox3ToViewport({
  camera,
  localBounds,
  meshMatrixWorld,
  viewportHeight,
  viewportWidth,
}: ProjectedBoundsArgs) {
  if (localBounds.isEmpty() || viewportWidth <= 0 || viewportHeight <= 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let hasProjectedCorner = false;

  for (const corner of createBox3Corners(localBounds)) {
    corner.applyMatrix4(meshMatrixWorld).project(camera);

    if (
      !Number.isFinite(corner.x) ||
      !Number.isFinite(corner.y) ||
      !Number.isFinite(corner.z)
    ) {
      continue;
    }

    hasProjectedCorner = true;

    const x = (corner.x * 0.5 + 0.5) * viewportWidth;
    const y = (1 - (corner.y * 0.5 + 0.5)) * viewportHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!hasProjectedCorner) {
    return null;
  }

  return clampRectToViewport(
    {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    viewportWidth,
    viewportHeight,
  );
}

export function getMeshFootprintScale({
  camera,
  localBounds,
  lookAtTarget,
  meshMatrixWorld,
  viewportHeight,
  viewportWidth,
}: MeshFootprintScaleArgs) {
  const currentRect = projectBox3ToViewport({
    camera,
    localBounds,
    meshMatrixWorld,
    viewportHeight,
    viewportWidth,
  });
  const referenceCamera = camera.clone();
  const currentOffset = referenceCamera.position.clone().sub(lookAtTarget);
  const referenceOffset =
    currentOffset.lengthSq() > 0
      ? currentOffset.setLength(REFERENCE_PREVIEW_DISTANCE)
      : new THREE.Vector3(0, 0, REFERENCE_PREVIEW_DISTANCE);

  referenceCamera.position.copy(lookAtTarget).add(referenceOffset);
  referenceCamera.lookAt(lookAtTarget);
  referenceCamera.updateProjectionMatrix();
  referenceCamera.updateMatrixWorld(true);

  const referenceRect = projectBox3ToViewport({
    camera: referenceCamera,
    localBounds,
    meshMatrixWorld,
    viewportHeight,
    viewportWidth,
  });

  return getFootprintScaleFromRects(currentRect, referenceRect);
}

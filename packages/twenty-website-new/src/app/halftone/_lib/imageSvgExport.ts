import {
  getContainedImageRect,
  getImageFootprintScale,
  getImagePreviewZoom,
} from '@/app/halftone/_lib/footprint';
import type { HalftoneStudioSettings } from '@/app/halftone/_lib/state';

type PixelBounds = {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
};

type PathGroup = {
  commands: string[];
  strokeOpacity: string;
  strokeWidth: string;
};

type GenerateImageHalftoneSvgOptions = {
  backgroundColor: string;
  image: HTMLImageElement;
  includeBackground: boolean;
  previewDistance: number;
  settings: HalftoneStudioSettings;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / Math.max(edge1 - edge0, 0.000001), 0, 1);

  return x * x * (3 - 2 * x);
}

function formatNumber(value: number) {
  return Number(value.toFixed(3)).toString();
}

function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function getHorizontalAlphaSegments(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  y: number,
  xStart: number,
  xEnd: number,
  threshold = 8,
) {
  const clampedY = clamp(Math.round(y), 0, height - 1);
  const minX = clamp(Math.floor(xStart), 0, width - 1);
  const maxX = clamp(Math.ceil(xEnd) - 1, 0, width - 1);

  if (maxX < minX) {
    return [];
  }

  const segments: Array<{ x1: number; x2: number }> = [];
  let segmentStart: number | null = null;

  for (let x = minX; x <= maxX; x++) {
    const alpha = pixels[(clampedY * width + x) * 4 + 3];
    const isOpaque = alpha > threshold;

    if (isOpaque && segmentStart === null) {
      segmentStart = x;
      continue;
    }

    if (!isOpaque && segmentStart !== null) {
      segments.push({
        x1: Math.max(xStart, segmentStart),
        x2: Math.min(xEnd, x),
      });
      segmentStart = null;
    }
  }

  if (segmentStart !== null) {
    segments.push({
      x1: Math.max(xStart, segmentStart),
      x2: Math.min(xEnd, maxX + 1),
    });
  }

  return segments.filter((segment) => segment.x2 > segment.x1);
}

export function generateImageHalftoneSvg({
  backgroundColor,
  image,
  includeBackground,
  previewDistance,
  settings,
  width,
  height,
}: GenerateImageHalftoneSvgOptions) {
  if (
    width <= 0 ||
    height <= 0 ||
    image.naturalWidth <= 0 ||
    image.naturalHeight <= 0
  ) {
    return null;
  }

  const imageRect = getContainedImageRect({
    imageHeight: image.naturalHeight,
    imageWidth: image.naturalWidth,
    viewportHeight: height,
    viewportWidth: width,
    zoom: getImagePreviewZoom(previewDistance),
  });

  if (!imageRect) {
    return null;
  }

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext('2d');

  if (!sourceContext) {
    return null;
  }

  sourceContext.clearRect(0, 0, width, height);
  sourceContext.drawImage(
    image,
    imageRect.x,
    imageRect.y,
    imageRect.width,
    imageRect.height,
  );

  const pixels = sourceContext.getImageData(0, 0, width, height).data;
  const footprintScale = getImageFootprintScale({
    imageHeight: image.naturalHeight,
    imageWidth: image.naturalWidth,
    previewDistance,
    viewportHeight: height,
    viewportWidth: width,
  });
  const halftoneSize = Math.max(
    settings.halftone.scale * Math.max(footprintScale, 0.001),
    1,
  );
  const localPower = clamp(settings.halftone.power, -1.5, 1.5);
  const localWidth = clamp(settings.halftone.width, 0.05, 1.4);
  const toneTargetMultiplier =
    settings.halftone.toneTarget === 'dark' ? -1 : 1;
  const lineColor = settings.halftone.dashColor;
  const columns = Math.ceil(width / halftoneSize);
  const rows = Math.ceil(height / halftoneSize);
  const pathGroups = new Map<string, PathGroup>();
  let lineBounds: PixelBounds | null = null;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const sampleX = clamp((column + 0.5) * halftoneSize, 0, width - 1);
      const sampleY = clamp((row + 0.5) * halftoneSize, 0, height - 1);
      const sampleIndex =
        (Math.floor(sampleY) * width + Math.floor(sampleX)) * 4;
      const alpha = pixels[sampleIndex + 3] / 255;
      const mask = smoothstep(0.02, 0.08, alpha);

      if (mask <= 0) {
        continue;
      }

      const contrast = settings.halftone.imageContrast;
      const red = clamp(
        ((pixels[sampleIndex] / 255 - 0.5) * contrast) + 0.5,
        0,
        1,
      );
      const green = clamp(
        ((pixels[sampleIndex + 1] / 255 - 0.5) * contrast) + 0.5,
        0,
        1,
      );
      const blue = clamp(
        ((pixels[sampleIndex + 2] / 255 - 0.5) * contrast) + 0.5,
        0,
        1,
      );
      let toneValue = (red + green + blue) / 3;

      if (toneTargetMultiplier < 0) {
        toneValue = 1 - toneValue;
      }

      // Preserve the pre-toneTarget light-mode response by keeping the power
      // bias inside the averaged tone calculation.
      const bandRadius =
        clamp(toneValue + (localPower * Math.SQRT1_2) / 3, 0, 1) * 0.93;

      if (bandRadius <= 0.0001) {
        continue;
      }

      const strokeWidth = 2 * localWidth * bandRadius * halftoneSize;

      if (strokeWidth <= 0.001) {
        continue;
      }

      const centerY = (row + 0.5) * halftoneSize;
      const startX = (column + 0.5 - bandRadius) * halftoneSize;
      const endX = (column + 0.5 + bandRadius) * halftoneSize;
      const halfStroke = strokeWidth * 0.5;
      const segments = getHorizontalAlphaSegments(
        pixels,
        width,
        height,
        centerY,
        startX,
        endX,
      );
      const strokeWidthValue = formatNumber(strokeWidth);
      const strokeOpacityValue = formatNumber(mask);
      const styleKey = `${strokeWidthValue}|${strokeOpacityValue}`;
      let pathGroup = pathGroups.get(styleKey);

      if (!pathGroup) {
        pathGroup = {
          commands: [],
          strokeOpacity: strokeOpacityValue,
          strokeWidth: strokeWidthValue,
        };
        pathGroups.set(styleKey, pathGroup);
      }

      for (const segment of segments) {
        const command = `M ${formatNumber(segment.x1)} ${formatNumber(centerY)} H ${formatNumber(segment.x2)}`;
        const bounds = {
          minX: Math.floor(segment.x1 - halfStroke),
          minY: Math.floor(centerY - halfStroke),
          maxX: Math.ceil(segment.x2 + halfStroke),
          maxY: Math.ceil(centerY + halfStroke),
        };

        lineBounds = lineBounds
          ? {
              minX: Math.min(lineBounds.minX, bounds.minX),
              minY: Math.min(lineBounds.minY, bounds.minY),
              maxX: Math.max(lineBounds.maxX, bounds.maxX),
              maxY: Math.max(lineBounds.maxY, bounds.maxY),
            }
          : bounds;

        pathGroup.commands.push(command);
      }
    }
  }

  const fullBounds = {
    minX: 0,
    minY: 0,
    maxX: width - 1,
    maxY: height - 1,
  };
  const croppedBounds = includeBackground
    ? fullBounds
    : (lineBounds ?? fullBounds);
  const exportWidth = croppedBounds.maxX - croppedBounds.minX + 1;
  const exportHeight = croppedBounds.maxY - croppedBounds.minY + 1;
  const paths = Array.from(pathGroups.values()).map(
    (group) =>
      `<path d="${group.commands.join(' ')}" fill="none" stroke="${escapeAttribute(lineColor)}" stroke-opacity="${group.strokeOpacity}" stroke-width="${group.strokeWidth}" stroke-linecap="round" />`,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${formatNumber(exportWidth)}" height="${formatNumber(exportHeight)}" viewBox="0 0 ${formatNumber(exportWidth)} ${formatNumber(exportHeight)}" fill="none">`,
    includeBackground
      ? `<rect width="${formatNumber(exportWidth)}" height="${formatNumber(exportHeight)}" fill="${escapeAttribute(backgroundColor)}" />`
      : '',
    `<g transform="translate(${formatNumber(-croppedBounds.minX)} ${formatNumber(-croppedBounds.minY)})">`,
    ...paths,
    '</g>',
    '</svg>',
  ]
    .filter(Boolean)
    .join('');
}

import { normalizeExportComponentName } from '@/lib/halftone/utils/export-names';
import { REFERENCE_PREVIEW_DISTANCE } from '@/lib/halftone/utils/footprint';
import {
  LEGACY_HALFTONE_SETTING_KEYS,
  isRoundedBandHalftoneSettings,
  type HalftoneExportPose,
  type HalftoneGeometrySpec,
  type HalftoneStudioSettings,
} from '@/lib/halftone/utils/state';

import type {
  ExportedShapeDescriptor,
  ParsedExportedPreset,
} from '../types/exporter-types';

function createDefaultExportPose(): HalftoneExportPose {
  return {
    autoElapsed: 0,
    rotateElapsed: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    timeElapsed: 0,
  };
}

export function normalizeExportPose(
  pose: HalftoneExportPose | undefined,
): HalftoneExportPose {
  const fallback = createDefaultExportPose();

  if (!pose) {
    return fallback;
  }

  return {
    autoElapsed: Number.isFinite(pose.autoElapsed) ? pose.autoElapsed : 0,
    rotateElapsed: Number.isFinite(pose.rotateElapsed) ? pose.rotateElapsed : 0,
    rotationX: Number.isFinite(pose.rotationX) ? pose.rotationX : 0,
    rotationY: Number.isFinite(pose.rotationY) ? pose.rotationY : 0,
    rotationZ: Number.isFinite(pose.rotationZ) ? pose.rotationZ : 0,
    targetRotationX: Number.isFinite(pose.targetRotationX)
      ? pose.targetRotationX
      : 0,
    targetRotationY: Number.isFinite(pose.targetRotationY)
      ? pose.targetRotationY
      : 0,
    timeElapsed: Number.isFinite(pose.timeElapsed) ? pose.timeElapsed : 0,
  };
}

export function normalizePreviewDistance(previewDistance: number | undefined) {
  return Number.isFinite(previewDistance)
    ? Math.max(previewDistance ?? REFERENCE_PREVIEW_DISTANCE, 0.001)
    : REFERENCE_PREVIEW_DISTANCE;
}

function extractSerializedJson<T>(
  content: string,
  name: string,
  nextName: string,
) {
  const pattern = new RegExp(
    String.raw`const\s+${name}\s*=\s*([\s\S]*?)\s*;\s*\r?\nconst\s+${nextName}\s*=`,
  );
  const match = content.match(pattern);

  if (!match) {
    throw new Error(`Could not find ${name} in the exported preset.`);
  }

  try {
    return JSON.parse(match[1]) as T;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Could not parse ${name}: ${error.message}`
        : `Could not parse ${name}.`,
    );
  }
}

function extractFirstMatch(content: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = content.match(pattern);

    if (match && match.length > 1) {
      return match[match.length - 1] ?? null;
    }
  }

  return null;
}

function assertRoundedBandPreset(
  settings: HalftoneStudioSettings,
): asserts settings is HalftoneStudioSettings {
  if (isRoundedBandHalftoneSettings(settings.halftone)) {
    return;
  }

  const halftoneValue =
    settings.halftone && typeof settings.halftone === 'object'
      ? (settings.halftone as Record<string, unknown>)
      : null;
  const detectedLegacyKeys = LEGACY_HALFTONE_SETTING_KEYS.filter((key) =>
    halftoneValue ? key in halftoneValue : false,
  );
  const suffix =
    detectedLegacyKeys.length > 0
      ? ` Detected legacy keys: ${detectedLegacyKeys.join(', ')}.`
      : '';

  throw new Error(
    `This preset uses the legacy halftone effect and can no longer be imported.${suffix}`,
  );
}

export function parseExportedPreset(content: string): ParsedExportedPreset {
  const settings = extractSerializedJson<HalftoneStudioSettings>(
    content,
    'settings',
    'shape',
  );
  assertRoundedBandPreset(settings);
  const shape = extractSerializedJson<ExportedShapeDescriptor>(
    content,
    'shape',
    'initialPose',
  );
  const initialPose = normalizeExportPose(
    (() => {
      try {
        return extractSerializedJson<HalftoneExportPose>(
          content,
          'initialPose',
          'previewDistance',
        );
      } catch {
        return extractSerializedJson<HalftoneExportPose>(
          content,
          'initialPose',
          'VIRTUAL_RENDER_HEIGHT',
        );
      }
    })(),
  );
  const previewDistanceMatch = content.match(
    /const\s+previewDistance\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*;/,
  );
  const previewDistance = normalizePreviewDistance(
    previewDistanceMatch ? Number(previewDistanceMatch[1]) : undefined,
  );
  const componentName =
    extractFirstMatch(content, [
      /export\s+default\s+function\s+([A-Za-z0-9_]+)/,
      /export\s+function\s+([A-Za-z0-9_]+)/,
      /export\s+default\s+([A-Za-z0-9_]+)\s*;/,
      /<title>([^<]+)<\/title>/i,
    ]) ?? null;
  const modelAssetReference = extractFirstMatch(content, [
    /modelUrl\s*=\s*(['"`])([\s\S]*?)\1/,
    /modelUrl\s*:\s*(['"`])([\s\S]*?)\1/,
  ]);
  const imageAssetReference = extractFirstMatch(content, [
    /imageUrl\s*=\s*(['"`])([\s\S]*?)\1/,
    /imageUrl\s*:\s*(['"`])([\s\S]*?)\1/,
  ]);

  return {
    componentName,
    imageAssetReference,
    initialPose,
    modelAssetReference,
    previewDistance,
    settings,
    shape,
  };
}

export function deriveExportComponentName(
  shape: HalftoneGeometrySpec | undefined,
  importedFile: File | undefined,
) {
  const source =
    importedFile?.name ??
    shape?.filename ??
    shape?.label ??
    shape?.key ??
    'HalftoneDashes';

  return normalizeExportComponentName(source);
}

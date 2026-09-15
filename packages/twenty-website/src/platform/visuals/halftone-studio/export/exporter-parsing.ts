import { HALFTONE_FOOTPRINT } from '../engine/footprint';
import type {
  HalftoneEffectSettings,
  HalftoneExportPose,
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
  HalftoneToneTarget,
} from '../engine/studio-settings-types';

import { HALFTONE_EXPORT_NAMES } from './export-names';
import type {
  ExportedShapeDescriptor,
  ParsedExportedPreset,
} from './exporter-types';

// Halftone keys that only existed in the pre-rounded-band effect. Their
// presence in a parsed preset means it can no longer be imported.
const LEGACY_HALFTONE_SETTING_KEYS = [
  'numRows',
  'contrast',
  'shading',
  'baseInk',
  'maxBar',
  'rowMerge',
  'cellRatio',
  'cutoff',
  'highlightOpen',
  'shadowGrouping',
  'shadowCrush',
] as const;

function isRoundedBandHalftoneSettings(value: unknown): value is Omit<
  HalftoneEffectSettings,
  'hoverDashColor' | 'toneTarget'
> & {
  hoverDashColor?: string;
  toneTarget?: HalftoneToneTarget;
} {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.enabled === 'boolean' &&
    typeof candidate.scale === 'number' &&
    typeof candidate.power === 'number' &&
    typeof candidate.width === 'number' &&
    typeof candidate.imageContrast === 'number' &&
    typeof candidate.dashColor === 'string' &&
    (candidate.toneTarget === 'light' ||
      candidate.toneTarget === 'dark' ||
      typeof candidate.toneTarget === 'undefined') &&
    (typeof candidate.hoverDashColor === 'string' ||
      typeof candidate.hoverDashColor === 'undefined')
  );
}

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

function normalizeExportPose(
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

function normalizePreviewDistance(previewDistance: number | undefined) {
  return Number.isFinite(previewDistance)
    ? Math.max(
        previewDistance ?? HALFTONE_FOOTPRINT.referencePreviewDistance,
        0.001,
      )
    : HALFTONE_FOOTPRINT.referencePreviewDistance;
}

function extractSerializedJson<TData>(
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
    return JSON.parse(match[1]) as TData;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Could not parse ${name}: ${error.message}`
        : `Could not parse ${name}.`,
      { cause: error },
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

function parseExportedPreset(content: string): ParsedExportedPreset {
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

function deriveExportComponentName(
  shape: HalftoneGeometrySpec | undefined,
  importedFile: File | undefined,
) {
  const source =
    importedFile?.name ??
    shape?.filename ??
    shape?.label ??
    shape?.key ??
    'HalftoneDashes';

  return HALFTONE_EXPORT_NAMES.normalizeComponentName(source);
}

export const HALFTONE_EXPORT_PARSING = {
  normalizePose: normalizeExportPose,
  normalizePreviewDistance,
  parsePreset: parseExportedPreset,
  deriveComponentName: deriveExportComponentName,
};

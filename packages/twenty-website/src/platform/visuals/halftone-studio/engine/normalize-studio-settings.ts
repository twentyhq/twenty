import { HALFTONE_STUDIO_DEFAULTS } from './studio-settings-defaults';
import {
  type HalftoneBackgroundSettings,
  type HalftoneEffectSettings,
  type HalftoneLightingSettings,
  type HalftoneMaterialSettings,
  type HalftoneMaterialSurface,
  type HalftoneSourceMode,
  type HalftoneStudioSettings,
  type HalftoneStudioSettingsOverrides,
} from './studio-settings-types';

function getDefaultLightingSettings(
  surface: HalftoneMaterialSurface,
): HalftoneLightingSettings {
  return surface === 'glass'
    ? HALFTONE_STUDIO_DEFAULTS.glassLighting
    : HALFTONE_STUDIO_DEFAULTS.solidLighting;
}

function getDefaultBackgroundSettings(
  surface: HalftoneMaterialSurface,
): HalftoneBackgroundSettings {
  return surface === 'glass'
    ? HALFTONE_STUDIO_DEFAULTS.glassBackground
    : HALFTONE_STUDIO_DEFAULTS.solidBackground;
}

function getDefaultAnimationSettings(surface: HalftoneMaterialSurface) {
  return surface === 'glass'
    ? HALFTONE_STUDIO_DEFAULTS.glassAnimation
    : HALFTONE_STUDIO_DEFAULTS.solidAnimation;
}

function getDefaultHalftoneSettings(sourceMode: HalftoneSourceMode) {
  return sourceMode === 'image'
    ? HALFTONE_STUDIO_DEFAULTS.imageHalftone
    : HALFTONE_STUDIO_DEFAULTS.shapeHalftone;
}

function normalizeHalftoneEffectSettings(
  defaults: HalftoneEffectSettings,
  settings?: Partial<HalftoneEffectSettings>,
): HalftoneEffectSettings {
  return {
    enabled: settings?.enabled ?? defaults.enabled,
    scale: settings?.scale ?? defaults.scale,
    power: settings?.power ?? defaults.power,
    toneTarget: settings?.toneTarget ?? defaults.toneTarget,
    width: settings?.width ?? defaults.width,
    imageContrast: settings?.imageContrast ?? defaults.imageContrast,
    dashColor: settings?.dashColor ?? defaults.dashColor,
    hoverDashColor: settings?.hoverDashColor ?? defaults.hoverDashColor,
  };
}

function normalizeMaterialSettings(
  settings?: Partial<HalftoneMaterialSettings>,
): HalftoneMaterialSettings {
  const surface = settings?.surface === 'glass' ? 'glass' : 'solid';
  const defaults =
    surface === 'glass'
      ? HALFTONE_STUDIO_DEFAULTS.glassMaterial
      : HALFTONE_STUDIO_DEFAULTS.solidMaterial;

  return {
    surface,
    color:
      typeof settings?.color === 'string' ? settings.color : defaults.color,
    roughness:
      typeof settings?.roughness === 'number'
        ? settings.roughness
        : defaults.roughness,
    metalness:
      typeof settings?.metalness === 'number'
        ? settings.metalness
        : defaults.metalness,
    thickness:
      typeof settings?.thickness === 'number'
        ? settings.thickness
        : defaults.thickness,
    refraction:
      typeof settings?.refraction === 'number'
        ? settings.refraction
        : defaults.refraction,
    environmentPower:
      typeof settings?.environmentPower === 'number'
        ? settings.environmentPower
        : defaults.environmentPower,
  };
}

function materialMatches(
  value: Partial<HalftoneMaterialSettings> | undefined,
  target: HalftoneMaterialSettings,
) {
  return (
    value?.surface === target.surface &&
    value?.color === target.color &&
    value?.roughness === target.roughness &&
    value?.metalness === target.metalness &&
    value?.thickness === target.thickness &&
    value?.refraction === target.refraction &&
    value?.environmentPower === target.environmentPower
  );
}

export function normalizeHalftoneStudioSettings(
  settings?: HalftoneStudioSettingsOverrides,
): HalftoneStudioSettings {
  const sourceMode =
    settings?.sourceMode ?? HALFTONE_STUDIO_DEFAULTS.settings.sourceMode;
  const mergedMaterial = normalizeMaterialSettings(settings?.material);
  const material =
    mergedMaterial.surface === 'glass' &&
    materialMatches(
      settings?.material,
      HALFTONE_STUDIO_DEFAULTS.legacyGlassMaterial,
    )
      ? { ...HALFTONE_STUDIO_DEFAULTS.glassMaterial }
      : mergedMaterial;
  const lightingDefaults = getDefaultLightingSettings(material.surface);
  const backgroundDefaults = getDefaultBackgroundSettings(material.surface);
  const animationDefaults = getDefaultAnimationSettings(material.surface);

  return {
    ...HALFTONE_STUDIO_DEFAULTS.settings,
    ...settings,
    sourceMode,
    lighting: {
      ...lightingDefaults,
      ...settings?.lighting,
    },
    material,
    halftone: normalizeHalftoneEffectSettings(
      getDefaultHalftoneSettings(sourceMode),
      settings?.halftone,
    ),
    background: {
      ...backgroundDefaults,
      ...settings?.background,
    },
    animation: {
      ...animationDefaults,
      ...settings?.animation,
    },
  };
}

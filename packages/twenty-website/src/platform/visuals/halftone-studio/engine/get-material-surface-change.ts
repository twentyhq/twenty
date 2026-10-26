import { HALFTONE_STUDIO_DEFAULTS } from './studio-settings-defaults';
import type {
  HalftoneMaterialSurface,
  HalftoneStudioSettings,
} from './studio-settings-types';

function matchesSettings<TSettings extends object>(
  value: TSettings,
  target: TSettings,
) {
  return (Object.keys(target) as Array<keyof TSettings>).every(
    (key) => value[key] === target[key],
  );
}

export function getMaterialSurfaceChange(
  settings: HalftoneStudioSettings,
  surface: HalftoneMaterialSurface,
) {
  const currentSurface = settings.material.surface;

  return {
    animation: matchesSettings(
      settings.animation,
      HALFTONE_STUDIO_DEFAULTS.animationBySurface[currentSurface],
    )
      ? HALFTONE_STUDIO_DEFAULTS.animationBySurface[surface]
      : null,
    lighting: matchesSettings(
      settings.lighting,
      HALFTONE_STUDIO_DEFAULTS.lightingBySurface[currentSurface],
    )
      ? HALFTONE_STUDIO_DEFAULTS.lightingBySurface[surface]
      : null,
    material: HALFTONE_STUDIO_DEFAULTS.materialBySurface[surface],
  };
}

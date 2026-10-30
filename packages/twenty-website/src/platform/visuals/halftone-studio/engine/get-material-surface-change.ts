import { typedObjectEntries } from 'twenty-shared/utils';

import { HALFTONE_STUDIO_DEFAULTS } from './studio-settings-defaults';
import type {
  HalftoneMaterialSurface,
  HalftoneStudioSettings,
} from './studio-settings-types';

function matchesSettings<TSettings extends Record<string, unknown>>({
  target,
  value,
}: {
  target: TSettings;
  value: TSettings;
}) {
  return typedObjectEntries(target).every(
    ([key, targetValue]) => value[key] === targetValue,
  );
}

export function getMaterialSurfaceChange({
  settings,
  surface,
}: {
  settings: Pick<HalftoneStudioSettings, 'animation' | 'lighting' | 'material'>;
  surface: HalftoneMaterialSurface;
}) {
  const currentSurface = settings.material.surface;

  return {
    animation: matchesSettings({
      target: HALFTONE_STUDIO_DEFAULTS.animationBySurface[currentSurface],
      value: settings.animation,
    })
      ? HALFTONE_STUDIO_DEFAULTS.animationBySurface[surface]
      : null,
    lighting: matchesSettings({
      target: HALFTONE_STUDIO_DEFAULTS.lightingBySurface[currentSurface],
      value: settings.lighting,
    })
      ? HALFTONE_STUDIO_DEFAULTS.lightingBySurface[surface]
      : null,
    material: HALFTONE_STUDIO_DEFAULTS.materialBySurface[surface],
  };
}

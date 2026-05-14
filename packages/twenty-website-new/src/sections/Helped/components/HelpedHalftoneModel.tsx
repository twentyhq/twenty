'use client';

import {
  DEFAULT_GLASS_ANIMATION_SETTINGS,
  DEFAULT_GLASS_BACKGROUND_SETTINGS,
  DEFAULT_GLASS_MATERIAL_SETTINGS,
  DEFAULT_SHAPE_HALFTONE_SETTINGS,
  DEFAULT_SOLID_ANIMATION_SETTINGS,
  DEFAULT_SOLID_BACKGROUND_SETTINGS,
  DEFAULT_SOLID_MATERIAL_SETTINGS,
  HalftoneModelCanvas,
  type HalftoneMaterialSurface,
  type HalftoneStudioSettings,
} from '@/lib/halftone';
import type { HelpedHalftonePose } from '../types/helped-halftone-pose';
import type { HelpedHalftoneSettings } from '../types/helped-halftone-settings';

type HelpedHalftoneModelProps = {
  initialPose: HelpedHalftonePose;
  label: string;
  modelUrl: string;
  previewDistance: number;
  settings: HelpedHalftoneSettings;
};

function getMaterialSurface(
  settings: HelpedHalftoneSettings,
): HalftoneMaterialSurface {
  return settings.material.surface === 'glass' ? 'glass' : 'solid';
}

function createStudioSettings(
  settings: HelpedHalftoneSettings,
): HalftoneStudioSettings {
  const surface = getMaterialSurface(settings);
  const defaultMaterial =
    surface === 'glass'
      ? DEFAULT_GLASS_MATERIAL_SETTINGS
      : DEFAULT_SOLID_MATERIAL_SETTINGS;
  const defaultAnimation =
    surface === 'glass'
      ? DEFAULT_GLASS_ANIMATION_SETTINGS
      : DEFAULT_SOLID_ANIMATION_SETTINGS;
  const defaultBackground =
    surface === 'glass'
      ? DEFAULT_GLASS_BACKGROUND_SETTINGS
      : DEFAULT_SOLID_BACKGROUND_SETTINGS;

  return {
    sourceMode: 'shape',
    shapeKey: 'helped',
    lighting: { ...settings.lighting },
    material: {
      ...defaultMaterial,
      ...settings.material,
      surface,
    },
    halftone: {
      ...DEFAULT_SHAPE_HALFTONE_SETTINGS,
      ...settings.halftone,
      toneTarget:
        settings.halftone.toneTarget ??
        DEFAULT_SHAPE_HALFTONE_SETTINGS.toneTarget,
      hoverDashColor:
        settings.halftone.hoverDashColor ?? settings.halftone.dashColor,
      imageContrast:
        settings.halftone.imageContrast ??
        DEFAULT_SHAPE_HALFTONE_SETTINGS.imageContrast,
    },
    background: defaultBackground,
    animation: {
      ...defaultAnimation,
      ...settings.animation,
    },
  };
}

export function HelpedHalftoneModel({
  initialPose,
  label,
  modelUrl,
  previewDistance,
  settings,
}: HelpedHalftoneModelProps) {
  return (
    <HalftoneModelCanvas
      initialPose={initialPose}
      modelLabel={label}
      modelUrl={modelUrl}
      previewDistance={previewDistance}
      renderStrategy="static"
      settings={createStudioSettings(settings)}
    />
  );
}

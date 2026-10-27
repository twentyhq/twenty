'use client';

import { isDefined } from 'twenty-shared/utils';

import { getMaterialSurfaceChange } from '../../engine/get-material-surface-change';
import type {
  HalftoneMaterialSurface,
  HalftoneStudioSettings,
} from '../../engine/studio-settings-types';

import { CONTROLS_PANEL_SHELL } from './controls-panel-shell';
import { CONTROLS_SECTION } from './ControlsSection';
import { HALFTONE_FORMATTERS } from './formatters';
import { GlassMaterialControls } from './GlassMaterialControls';
import { MaterialTextureControls } from './MaterialTextureControls';
import { SegmentedControl } from './SegmentedControl';
import { SliderControl } from './SliderControl';

const MATERIAL_SURFACE_OPTIONS: Array<{
  label: string;
  value: HalftoneMaterialSurface;
}> = [
  { label: 'Solid', value: 'solid' },
  { label: 'Glass', value: 'glass' },
  { label: 'Metal', value: 'metal' },
];

type MaterialControlsProps = {
  onAnimationSettingsChange: (
    value: Partial<HalftoneStudioSettings['animation']>,
  ) => void;
  onLightingChange: (
    value: Partial<HalftoneStudioSettings['lighting']>,
  ) => void;
  onMaterialChange: (
    value: Partial<HalftoneStudioSettings['material']>,
  ) => void;
  settings: HalftoneStudioSettings;
};

export function MaterialControls({
  onAnimationSettingsChange,
  onLightingChange,
  onMaterialChange,
  settings,
}: MaterialControlsProps) {
  const handleSurfaceChange = (surface: HalftoneMaterialSurface) => {
    const surfaceChange = getMaterialSurfaceChange({ settings, surface });

    onMaterialChange(surfaceChange.material);

    if (isDefined(surfaceChange.lighting)) {
      onLightingChange(surfaceChange.lighting);
    }

    if (isDefined(surfaceChange.animation)) {
      onAnimationSettingsChange(surfaceChange.animation);
    }
  };

  return (
    <CONTROLS_SECTION.Section>
      <CONTROLS_SECTION.Title>Material</CONTROLS_SECTION.Title>
      <CONTROLS_PANEL_SHELL.ControlGrid>
        <SegmentedControl
          onChange={(value) => {
            const option = MATERIAL_SURFACE_OPTIONS.find(
              (surfaceOption) => surfaceOption.value === value,
            );

            if (isDefined(option)) {
              handleSurfaceChange(option.value);
            }
          }}
          options={MATERIAL_SURFACE_OPTIONS}
          value={settings.material.surface}
        >
          Surface
        </SegmentedControl>
        <SliderControl
          max={1}
          min={0}
          onChange={(event) =>
            onMaterialChange({ roughness: Number(event.target.value) })
          }
          step={0.01}
          value={settings.material.roughness}
          valueLabel={HALFTONE_FORMATTERS.decimal(settings.material.roughness)}
        >
          Roughness
        </SliderControl>
        <SliderControl
          max={1}
          min={0}
          onChange={(event) =>
            onMaterialChange({ metalness: Number(event.target.value) })
          }
          step={0.01}
          value={settings.material.metalness}
          valueLabel={HALFTONE_FORMATTERS.decimal(settings.material.metalness)}
        >
          Metalness
        </SliderControl>
        <SliderControl
          max={5}
          min={0}
          onChange={(event) =>
            onMaterialChange({
              environmentPower: Number(event.target.value),
            })
          }
          step={0.01}
          value={settings.material.environmentPower}
          valueLabel={HALFTONE_FORMATTERS.decimal(
            settings.material.environmentPower,
            2,
          )}
        >
          Environment
        </SliderControl>
        <SliderControl
          max={360}
          min={0}
          onChange={(event) =>
            onMaterialChange({
              environmentRotation: Number(event.target.value),
            })
          }
          value={settings.material.environmentRotation}
          valueLabel={HALFTONE_FORMATTERS.angle(
            settings.material.environmentRotation,
          )}
        >
          Rotation
        </SliderControl>
        <MaterialTextureControls
          material={settings.material}
          onMaterialChange={onMaterialChange}
        />
        {settings.material.surface === 'glass' ? (
          <GlassMaterialControls
            material={settings.material}
            onMaterialChange={onMaterialChange}
          />
        ) : null}
      </CONTROLS_PANEL_SHELL.ControlGrid>
    </CONTROLS_SECTION.Section>
  );
}

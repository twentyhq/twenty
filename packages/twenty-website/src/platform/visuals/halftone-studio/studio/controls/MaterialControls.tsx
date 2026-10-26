'use client';

import { isDefined } from 'twenty-shared/utils';

import type { HalftoneMaterialTexture } from '../../engine/material-texture';
import { HALFTONE_STUDIO_DEFAULTS } from '../../engine/studio-settings-defaults';
import type {
  HalftoneMaterialSurface,
  HalftoneStudioSettings,
} from '../../engine/studio-settings-types';

import { CONTROLS_PANEL_SHELL } from './controls-panel-shell';
import { CONTROLS_SECTION } from './ControlsSection';
import { HALFTONE_FORMATTERS } from './formatters';
import { SegmentedControl } from './SegmentedControl';
import { SelectControl } from './SelectControl';
import { SliderControl } from './SliderControl';

const MATERIAL_TEXTURE_OPTIONS: Array<{
  label: string;
  value: HalftoneMaterialTexture;
}> = [
  { label: 'None', value: 'none' },
  { label: 'Smudged', value: 'smudged' },
  { label: 'Worn', value: 'worn' },
  { label: 'Hammered', value: 'hammered' },
  { label: 'Brushed', value: 'brushed' },
];

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

function matchesSettings<TSettings extends object>(
  value: TSettings,
  target: TSettings,
) {
  return (Object.keys(target) as Array<keyof TSettings>).every(
    (key) => value[key] === target[key],
  );
}

export function MaterialControls({
  onAnimationSettingsChange,
  onLightingChange,
  onMaterialChange,
  settings,
}: MaterialControlsProps) {
  const handleSurfaceChange = (surface: HalftoneMaterialSurface) => {
    const currentSurface = settings.material.surface;

    onMaterialChange(HALFTONE_STUDIO_DEFAULTS.materialBySurface[surface]);

    if (
      matchesSettings(
        settings.lighting,
        HALFTONE_STUDIO_DEFAULTS.lightingBySurface[currentSurface],
      )
    ) {
      onLightingChange(HALFTONE_STUDIO_DEFAULTS.lightingBySurface[surface]);
    }

    if (
      matchesSettings(
        settings.animation,
        HALFTONE_STUDIO_DEFAULTS.animationBySurface[currentSurface],
      )
    ) {
      onAnimationSettingsChange(
        HALFTONE_STUDIO_DEFAULTS.animationBySurface[surface],
      );
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
        <SelectControl
          onChange={(event) => {
            const option = MATERIAL_TEXTURE_OPTIONS.find(
              (textureOption) => textureOption.value === event.target.value,
            );

            if (isDefined(option)) {
              onMaterialChange({ texture: option.value });
            }
          }}
          options={MATERIAL_TEXTURE_OPTIONS}
          value={settings.material.texture}
        >
          Texture
        </SelectControl>
        {settings.material.texture !== 'none' ? (
          <SliderControl
            max={16}
            min={1}
            onChange={(event) =>
              onMaterialChange({
                textureTiling: Number(event.target.value),
              })
            }
            step={0.1}
            value={settings.material.textureTiling}
            valueLabel={HALFTONE_FORMATTERS.decimal(
              settings.material.textureTiling,
              1,
            )}
          >
            Tiling
          </SliderControl>
        ) : null}
        {settings.material.surface === 'glass' ? (
          <>
            <SliderControl
              max={20}
              min={1.1}
              onChange={(event) =>
                onMaterialChange({
                  thickness: Number(event.target.value),
                })
              }
              step={0.1}
              value={settings.material.thickness}
              valueLabel={HALFTONE_FORMATTERS.decimal(
                settings.material.thickness,
                0,
              )}
            >
              Thickness
            </SliderControl>
            <SliderControl
              max={3}
              min={1.1}
              onChange={(event) =>
                onMaterialChange({
                  refraction: Number(event.target.value),
                })
              }
              step={0.01}
              value={settings.material.refraction}
              valueLabel={HALFTONE_FORMATTERS.decimal(
                settings.material.refraction,
              )}
            >
              Refraction
            </SliderControl>
          </>
        ) : null}
      </CONTROLS_PANEL_SHELL.ControlGrid>
    </CONTROLS_SECTION.Section>
  );
}

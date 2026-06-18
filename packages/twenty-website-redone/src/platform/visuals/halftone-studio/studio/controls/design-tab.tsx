'use client';

import { styled } from '@linaria/react';

import { HALFTONE_STUDIO_DEFAULTS } from '../../engine/studio-settings-defaults';
import type {
  HalftoneBackgroundSettings,
  HalftoneSourceMode,
  HalftoneStudioSettings,
} from '../../engine/studio-settings-types';

import { ColorField } from './color-field';
import { CONTROLS_PANEL_SHELL } from './controls-panel-shell';
import { CONTROLS_SECTION } from './controls-section';
import { CONTROLS_TABS } from './controls-tabs';
import { HALFTONE_FORMATTERS } from './formatters';
import { SegmentedControl } from './segmented-control';
import { SelectInput } from './select-input';
import { SliderControl } from './slider-control';

const DEFAULT_IMAGE_FILE_NAME = 'twenty-logo.svg';
const DEFAULT_IMAGE_OPTION_LABEL = 'Twenty image';
const IMAGE_SOURCE_VALUE = '__image__';

const ColorSectionHeader = styled(CONTROLS_PANEL_SHELL.ColorControlRow)`
  margin-bottom: 10px;

  & > ${CONTROLS_SECTION.Title} {
    margin-bottom: 0;
  }
`;

const ColorSwapButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.34);
  cursor: pointer;
  display: inline-flex;
  height: 16px;
  justify-content: center;
  padding: 0;
  justify-self: end;
  transition: color 0.15s ease;
  width: 16px;

  &:hover {
    color: rgba(255, 255, 255, 0.78);
  }

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.35);
    outline-offset: 1px;
  }
`;

type DesignTabProps = {
  onAnimationSettingsChange: (
    value: Partial<HalftoneStudioSettings['animation']>,
  ) => void;
  imageFileName: string | null;
  onBackgroundChange: (value: Partial<HalftoneBackgroundSettings>) => void;
  onDashColorChange: (value: string) => void;
  onHalftoneChange: (
    value: Partial<HalftoneStudioSettings['halftone']>,
  ) => void;
  onLightingChange: (
    value: Partial<HalftoneStudioSettings['lighting']>,
  ) => void;
  onMaterialChange: (
    value: Partial<HalftoneStudioSettings['material']>,
  ) => void;
  onPreviewDistanceChange: (value: number) => void;
  onShapeChange: (value: string) => void;
  onSourceModeChange: (value: HalftoneSourceMode) => void;
  onUploadSource: () => void;
  previewDistance: number;
  settings: HalftoneStudioSettings;
  shapeOptions: Array<{ label: string; value: string }>;
};

function matchesSettings<TSettings extends object>(
  value: TSettings,
  target: TSettings,
) {
  return (Object.keys(target) as Array<keyof TSettings>).every(
    (key) => value[key] === target[key],
  );
}

export function DesignTab({
  onAnimationSettingsChange,
  imageFileName,
  onBackgroundChange,
  onDashColorChange,
  onHalftoneChange,
  onLightingChange,
  onMaterialChange,
  onPreviewDistanceChange,
  onShapeChange,
  onSourceModeChange,
  onUploadSource,
  previewDistance,
  settings,
  shapeOptions,
}: DesignTabProps) {
  const isImageMode = settings.sourceMode === 'image';
  const selectedSourceValue = isImageMode
    ? IMAGE_SOURCE_VALUE
    : settings.shapeKey;
  const imageOptionLabel =
    imageFileName === null || imageFileName === DEFAULT_IMAGE_FILE_NAME
      ? DEFAULT_IMAGE_OPTION_LABEL
      : imageFileName;

  const handleSurfaceChange = (surface: 'glass' | 'solid') => {
    const switchingToGlass = surface === 'glass';

    onMaterialChange(
      switchingToGlass
        ? HALFTONE_STUDIO_DEFAULTS.glassMaterial
        : HALFTONE_STUDIO_DEFAULTS.solidMaterial,
    );

    if (switchingToGlass) {
      if (
        matchesSettings(
          settings.lighting,
          HALFTONE_STUDIO_DEFAULTS.solidLighting,
        )
      ) {
        onLightingChange(HALFTONE_STUDIO_DEFAULTS.glassLighting);
      }

      if (
        matchesSettings(
          settings.animation,
          HALFTONE_STUDIO_DEFAULTS.solidAnimation,
        )
      ) {
        onAnimationSettingsChange(HALFTONE_STUDIO_DEFAULTS.glassAnimation);
      }

      return;
    }

    if (
      matchesSettings(settings.lighting, HALFTONE_STUDIO_DEFAULTS.glassLighting)
    ) {
      onLightingChange(HALFTONE_STUDIO_DEFAULTS.solidLighting);
    }

    if (
      matchesSettings(
        settings.animation,
        HALFTONE_STUDIO_DEFAULTS.glassAnimation,
      )
    ) {
      onAnimationSettingsChange(HALFTONE_STUDIO_DEFAULTS.solidAnimation);
    }
  };

  const handleSwapColors = () => {
    const nextDashColor = settings.background.color;
    const nextBackgroundColor = settings.halftone.dashColor;

    onDashColorChange(nextDashColor);
    onBackgroundChange({ color: nextBackgroundColor });
  };

  return (
    <CONTROLS_TABS.Content>
      <CONTROLS_SECTION.Section $first>
        <CONTROLS_SECTION.Title>Source</CONTROLS_SECTION.Title>
        <CONTROLS_PANEL_SHELL.ControlGrid>
          <CONTROLS_PANEL_SHELL.ShapeRow>
            <span>Source</span>
            <SelectInput
              onChange={(event) => {
                const nextValue = event.target.value;

                if (nextValue === IMAGE_SOURCE_VALUE) {
                  onSourceModeChange('image');
                  return;
                }

                onSourceModeChange('shape');
                onShapeChange(nextValue);
              }}
              value={selectedSourceValue}
            >
              <optgroup label="3D">
                {shapeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Images">
                <option value={IMAGE_SOURCE_VALUE}>{imageOptionLabel}</option>
              </optgroup>
            </SelectInput>
            <CONTROLS_PANEL_SHELL.UploadButton
              onClick={onUploadSource}
              title="Upload image or model (.png / .jpg / .webp / .svg / .fbx / .glb)"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <path d="M7 9l5 -5l5 5" />
                <path d="M12 4l0 12" />
              </svg>
            </CONTROLS_PANEL_SHELL.UploadButton>
          </CONTROLS_PANEL_SHELL.ShapeRow>
        </CONTROLS_PANEL_SHELL.ControlGrid>
      </CONTROLS_SECTION.Section>

      <CONTROLS_SECTION.Section>
        <CONTROLS_SECTION.Title>Visualization</CONTROLS_SECTION.Title>
        <CONTROLS_PANEL_SHELL.ControlGrid>
          <SliderControl
            max={12}
            min={4}
            onChange={(event) =>
              onPreviewDistanceChange(Number(event.target.value))
            }
            step={0.1}
            value={previewDistance}
            valueLabel={HALFTONE_FORMATTERS.decimal(previewDistance, 1)}
          >
            Distance
          </SliderControl>
        </CONTROLS_PANEL_SHELL.ControlGrid>
      </CONTROLS_SECTION.Section>

      {isImageMode ? (
        <CONTROLS_SECTION.Section>
          <CONTROLS_SECTION.Title>Image</CONTROLS_SECTION.Title>
          <CONTROLS_PANEL_SHELL.ControlGrid>
            <SliderControl
              max={2.5}
              min={0.4}
              onChange={(event) =>
                onHalftoneChange({
                  imageContrast: Number(event.target.value),
                })
              }
              step={0.01}
              value={settings.halftone.imageContrast}
              valueLabel={HALFTONE_FORMATTERS.decimal(
                settings.halftone.imageContrast,
                2,
              )}
            >
              Contrast
            </SliderControl>
          </CONTROLS_PANEL_SHELL.ControlGrid>
        </CONTROLS_SECTION.Section>
      ) : (
        <>
          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.Title>Lighting</CONTROLS_SECTION.Title>
            <CONTROLS_PANEL_SHELL.ControlGrid>
              <SliderControl
                max={4}
                min={0.5}
                onChange={(event) =>
                  onLightingChange({ intensity: Number(event.target.value) })
                }
                step={0.1}
                value={settings.lighting.intensity}
                valueLabel={HALFTONE_FORMATTERS.decimal(
                  settings.lighting.intensity,
                  1,
                )}
              >
                Light
              </SliderControl>
              <SliderControl
                max={1.5}
                min={0}
                onChange={(event) =>
                  onLightingChange({
                    fillIntensity: Number(event.target.value),
                  })
                }
                step={0.01}
                value={settings.lighting.fillIntensity}
                valueLabel={HALFTONE_FORMATTERS.decimal(
                  settings.lighting.fillIntensity,
                )}
              >
                Fill
              </SliderControl>
              <SliderControl
                max={0.3}
                min={0}
                onChange={(event) =>
                  onLightingChange({
                    ambientIntensity: Number(event.target.value),
                  })
                }
                step={0.01}
                value={settings.lighting.ambientIntensity}
                valueLabel={HALFTONE_FORMATTERS.decimal(
                  settings.lighting.ambientIntensity,
                )}
              >
                Ambient
              </SliderControl>
              <SliderControl
                max={360}
                min={0}
                onChange={(event) =>
                  onLightingChange({ angleDegrees: Number(event.target.value) })
                }
                value={settings.lighting.angleDegrees}
                valueLabel={HALFTONE_FORMATTERS.angle(
                  settings.lighting.angleDegrees,
                )}
              >
                Angle
              </SliderControl>
              <SliderControl
                max={8}
                min={-4}
                onChange={(event) =>
                  onLightingChange({ height: Number(event.target.value) })
                }
                step={0.1}
                value={settings.lighting.height}
                valueLabel={HALFTONE_FORMATTERS.decimal(
                  settings.lighting.height,
                  1,
                )}
              >
                Height
              </SliderControl>
            </CONTROLS_PANEL_SHELL.ControlGrid>
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.Title>Material</CONTROLS_SECTION.Title>
            <CONTROLS_PANEL_SHELL.ControlGrid>
              <SegmentedControl
                onChange={(value) =>
                  handleSurfaceChange(value === 'glass' ? 'glass' : 'solid')
                }
                options={[
                  { label: 'Solid', value: 'solid' },
                  { label: 'Glass', value: 'glass' },
                ]}
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
                valueLabel={HALFTONE_FORMATTERS.decimal(
                  settings.material.roughness,
                )}
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
                valueLabel={HALFTONE_FORMATTERS.decimal(
                  settings.material.metalness,
                )}
              >
                Metalness
              </SliderControl>
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
                    Power
                  </SliderControl>
                </>
              ) : null}
            </CONTROLS_PANEL_SHELL.ControlGrid>
          </CONTROLS_SECTION.Section>
        </>
      )}

      <CONTROLS_SECTION.Section>
        <CONTROLS_SECTION.ToggleHeader
          checked={settings.halftone.enabled}
          onChange={(event) =>
            onHalftoneChange({ enabled: event.target.checked })
          }
        >
          Halftone
        </CONTROLS_SECTION.ToggleHeader>
        {settings.halftone.enabled ? (
          <CONTROLS_PANEL_SHELL.ControlGrid>
            <SegmentedControl
              onChange={(value) =>
                onHalftoneChange({
                  toneTarget: value === 'dark' ? 'dark' : 'light',
                })
              }
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              value={settings.halftone.toneTarget}
            >
              Areas
            </SegmentedControl>
            <SliderControl
              max={72}
              min={8}
              onChange={(event) =>
                onHalftoneChange({ scale: Number(event.target.value) })
              }
              step={0.01}
              value={settings.halftone.scale}
              valueLabel={HALFTONE_FORMATTERS.decimal(
                settings.halftone.scale,
                2,
              )}
            >
              Scale
            </SliderControl>
            <SliderControl
              max={1.5}
              min={-1.5}
              onChange={(event) =>
                onHalftoneChange({ power: Number(event.target.value) })
              }
              step={0.01}
              value={settings.halftone.power}
              valueLabel={HALFTONE_FORMATTERS.decimal(
                settings.halftone.power,
                2,
              )}
            >
              Power
            </SliderControl>
            <SliderControl
              max={1.4}
              min={0.05}
              onChange={(event) =>
                onHalftoneChange({ width: Number(event.target.value) })
              }
              step={0.01}
              value={settings.halftone.width}
              valueLabel={HALFTONE_FORMATTERS.decimal(
                settings.halftone.width,
                2,
              )}
            >
              Width
            </SliderControl>
          </CONTROLS_PANEL_SHELL.ControlGrid>
        ) : null}
      </CONTROLS_SECTION.Section>

      <CONTROLS_SECTION.Section>
        <ColorSectionHeader>
          <CONTROLS_SECTION.Title>Colors</CONTROLS_SECTION.Title>
          <ColorSwapButton
            aria-label="Swap dash and background colors"
            onClick={handleSwapColors}
            title="Swap dash and background colors"
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 4l4 0l0 4" />
              <path d="M14.75 9.25l4.25 -5.25" />
              <path d="M5 19l4 -4" />
              <path d="M15 19l4 0l0 -4" />
              <path d="M5 5l14 14" />
            </svg>
          </ColorSwapButton>
        </ColorSectionHeader>
        <CONTROLS_PANEL_SHELL.ControlGrid>
          <CONTROLS_PANEL_SHELL.ColorControlRow>
            <CONTROLS_PANEL_SHELL.ColorControlLabel>
              Dash color
            </CONTROLS_PANEL_SHELL.ColorControlLabel>
            <ColorField
              ariaLabel="Dash color"
              onChange={onDashColorChange}
              value={settings.halftone.dashColor}
            />
          </CONTROLS_PANEL_SHELL.ColorControlRow>
          <CONTROLS_PANEL_SHELL.ColorControlRow>
            <CONTROLS_PANEL_SHELL.ColorControlLabel>
              Background
            </CONTROLS_PANEL_SHELL.ColorControlLabel>
            <ColorField
              ariaLabel="Background color"
              onChange={(value) => onBackgroundChange({ color: value })}
              value={settings.background.color}
            />
          </CONTROLS_PANEL_SHELL.ColorControlRow>
        </CONTROLS_PANEL_SHELL.ControlGrid>
      </CONTROLS_SECTION.Section>
    </CONTROLS_TABS.Content>
  );
}

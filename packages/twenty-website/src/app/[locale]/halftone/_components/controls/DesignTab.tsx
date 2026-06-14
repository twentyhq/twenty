'use client';

import { formatAngle, formatDecimal } from '@/lib/halftone/utils/formatters';
import {
  DEFAULT_GLASS_ANIMATION_SETTINGS,
  DEFAULT_GLASS_LIGHTING_SETTINGS,
  DEFAULT_GLASS_MATERIAL_SETTINGS,
  DEFAULT_SOLID_ANIMATION_SETTINGS,
  DEFAULT_SOLID_LIGHTING_SETTINGS,
  DEFAULT_SOLID_MATERIAL_SETTINGS,
  type HalftoneBackgroundSettings,
  type HalftoneSourceMode,
  type HalftoneStudioSettings,
} from '@/lib/halftone/utils/state';
import { styled } from '@linaria/react';
import {
  ColorControlLabel,
  ColorControlRow,
  ColorField,
  ControlGrid,
  Section,
  SectionTitle,
  SectionToggleHeader,
  SegmentedControl,
  SelectInput,
  ShapeRow,
  SliderControl,
  TabContent,
  UploadButton,
} from './controls-ui';

const DEFAULT_IMAGE_FILE_NAME = 'twenty-logo.svg';
const DEFAULT_IMAGE_OPTION_LABEL = 'Twenty image';
const IMAGE_SOURCE_VALUE = '__image__';

const ColorSectionHeader = styled(ColorControlRow)`
  margin-bottom: 10px;

  & > ${SectionTitle} {
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

function matchesSettings<T extends object>(value: T, target: T) {
  return (Object.keys(target) as Array<keyof T>).every(
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
        ? DEFAULT_GLASS_MATERIAL_SETTINGS
        : DEFAULT_SOLID_MATERIAL_SETTINGS,
    );

    if (switchingToGlass) {
      if (matchesSettings(settings.lighting, DEFAULT_SOLID_LIGHTING_SETTINGS)) {
        onLightingChange(DEFAULT_GLASS_LIGHTING_SETTINGS);
      }

      if (
        matchesSettings(settings.animation, DEFAULT_SOLID_ANIMATION_SETTINGS)
      ) {
        onAnimationSettingsChange(DEFAULT_GLASS_ANIMATION_SETTINGS);
      }

      return;
    }

    if (matchesSettings(settings.lighting, DEFAULT_GLASS_LIGHTING_SETTINGS)) {
      onLightingChange(DEFAULT_SOLID_LIGHTING_SETTINGS);
    }

    if (matchesSettings(settings.animation, DEFAULT_GLASS_ANIMATION_SETTINGS)) {
      onAnimationSettingsChange(DEFAULT_SOLID_ANIMATION_SETTINGS);
    }
  };

  const handleSwapColors = () => {
    const nextDashColor = settings.background.color;
    const nextBackgroundColor = settings.halftone.dashColor;

    onDashColorChange(nextDashColor);
    onBackgroundChange({ color: nextBackgroundColor });
  };

  return (
    <TabContent>
      <Section $first>
        <SectionTitle>Source</SectionTitle>
        <ControlGrid>
          <ShapeRow>
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
            <UploadButton
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
            </UploadButton>
          </ShapeRow>
        </ControlGrid>
      </Section>

      <Section>
        <SectionTitle>Visualization</SectionTitle>
        <ControlGrid>
          <SliderControl
            max={12}
            min={4}
            onChange={(event) =>
              onPreviewDistanceChange(Number(event.target.value))
            }
            step={0.1}
            value={previewDistance}
            valueLabel={formatDecimal(previewDistance, 1)}
          >
            Distance
          </SliderControl>
        </ControlGrid>
      </Section>

      {isImageMode ? (
        <Section>
          <SectionTitle>Image</SectionTitle>
          <ControlGrid>
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
              valueLabel={formatDecimal(settings.halftone.imageContrast, 2)}
            >
              Contrast
            </SliderControl>
          </ControlGrid>
        </Section>
      ) : (
        <>
          <Section>
            <SectionTitle>Lighting</SectionTitle>
            <ControlGrid>
              <SliderControl
                max={4}
                min={0.5}
                onChange={(event) =>
                  onLightingChange({ intensity: Number(event.target.value) })
                }
                step={0.1}
                value={settings.lighting.intensity}
                valueLabel={formatDecimal(settings.lighting.intensity, 1)}
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
                valueLabel={formatDecimal(settings.lighting.fillIntensity)}
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
                valueLabel={formatDecimal(settings.lighting.ambientIntensity)}
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
                valueLabel={formatAngle(settings.lighting.angleDegrees)}
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
                valueLabel={formatDecimal(settings.lighting.height, 1)}
              >
                Height
              </SliderControl>
            </ControlGrid>
          </Section>

          <Section>
            <SectionTitle>Material</SectionTitle>
            <ControlGrid>
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
                valueLabel={formatDecimal(settings.material.roughness)}
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
                valueLabel={formatDecimal(settings.material.metalness)}
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
                    valueLabel={formatDecimal(settings.material.thickness, 0)}
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
                    valueLabel={formatDecimal(settings.material.refraction)}
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
                    valueLabel={formatDecimal(
                      settings.material.environmentPower,
                      2,
                    )}
                  >
                    Power
                  </SliderControl>
                </>
              ) : null}
            </ControlGrid>
          </Section>
        </>
      )}

      <Section>
        <SectionToggleHeader
          checked={settings.halftone.enabled}
          onChange={(event) =>
            onHalftoneChange({ enabled: event.target.checked })
          }
        >
          Halftone
        </SectionToggleHeader>
        {settings.halftone.enabled ? (
          <ControlGrid>
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
              valueLabel={formatDecimal(settings.halftone.scale, 2)}
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
              valueLabel={formatDecimal(settings.halftone.power, 2)}
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
              valueLabel={formatDecimal(settings.halftone.width, 2)}
            >
              Width
            </SliderControl>
          </ControlGrid>
        ) : null}
      </Section>

      <Section>
        <ColorSectionHeader>
          <SectionTitle>Colors</SectionTitle>
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
        <ControlGrid>
          <ColorControlRow>
            <ColorControlLabel>Dash color</ColorControlLabel>
            <ColorField
              ariaLabel="Dash color"
              onChange={onDashColorChange}
              value={settings.halftone.dashColor}
            />
          </ColorControlRow>
          <ColorControlRow>
            <ColorControlLabel>Background</ColorControlLabel>
            <ColorField
              ariaLabel="Background color"
              onChange={(value) => onBackgroundChange({ color: value })}
              value={settings.background.color}
            />
          </ColorControlRow>
        </ControlGrid>
      </Section>
    </TabContent>
  );
}

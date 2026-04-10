'use client';

import { formatAngle, formatDecimal } from '@/app/halftone/_lib/formatters';
import {
  ColorControlLabel,
  ColorControlRow,
  ColorField,
  ControlGrid,
  Section,
  SectionTitle,
  SectionToggleHeader,
  SelectControl,
  SelectInput,
  ShapeRow,
  SliderControl,
  TabContent,
  UploadButton,
  ValueDisplay,
} from './controls-ui';

type HalftoneSourceMode = 'shape' | 'image';
type HalftoneRotateAxis = 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy';
type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';

interface HalftoneLightingSettings {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
}

interface HalftoneMaterialSettings {
  roughness: number;
  metalness: number;
}

interface HalftoneEffectSettings {
  enabled: boolean;
  numRows: number;
  contrast: number;
  power: number;
  shading: number;
  baseInk: number;
  maxBar: number;
  rowMerge: number;
  cellRatio: number;
  cutoff: number;
  highlightOpen: number;
  shadowGrouping: number;
  shadowCrush: number;
  dashColor: string;
}

interface HalftoneBackgroundSettings {
  transparent: boolean;
  color: string;
}

interface HalftoneAnimationSettings {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  cameraParallaxEnabled: boolean;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  floatEnabled: boolean;
  hoverLightEnabled: boolean;
  dragFlowEnabled: boolean;
  lightSweepEnabled: boolean;
  rotateEnabled: boolean;
  autoSpeed: number;
  autoWobble: number;
  breatheAmount: number;
  breatheSpeed: number;
  cameraParallaxAmount: number;
  cameraParallaxEase: number;
  driftAmount: number;
  hoverRange: number;
  hoverEase: number;
  hoverReturn: boolean;
  dragSens: number;
  dragFriction: number;
  dragMomentum: boolean;
  rotateAxis: HalftoneRotateAxis;
  rotatePreset: HalftoneRotatePreset;
  rotateSpeed: number;
  rotatePingPong: boolean;
  floatAmplitude: number;
  floatSpeed: number;
  lightSweepHeightRange: number;
  lightSweepRange: number;
  lightSweepSpeed: number;
  springDamping: number;
  springReturnEnabled: boolean;
  springStrength: number;
  hoverLightIntensity: number;
  hoverLightRadius: number;
  dragFlowDecay: number;
  dragFlowRadius: number;
  dragFlowStrength: number;
  hoverWarpStrength: number;
  hoverWarpRadius: number;
  dragWarpStrength: number;
  waveEnabled: boolean;
  waveSpeed: number;
  waveAmount: number;
}

interface HalftoneStudioSettings {
  sourceMode: HalftoneSourceMode;
  shapeKey: string;
  lighting: HalftoneLightingSettings;
  material: HalftoneMaterialSettings;
  halftone: HalftoneEffectSettings;
  background: HalftoneBackgroundSettings;
  animation: HalftoneAnimationSettings;
}

type DesignTabProps = {
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
  onUploadImage: () => void;
  onUploadModel: () => void;
  previewDistance: number;
  settings: HalftoneStudioSettings;
  shapeOptions: Array<{ label: string; value: string }>;
};

export function DesignTab({
  imageFileName,
  onBackgroundChange,
  onDashColorChange,
  onHalftoneChange,
  onLightingChange,
  onMaterialChange,
  onPreviewDistanceChange,
  onShapeChange,
  onSourceModeChange,
  onUploadImage,
  onUploadModel,
  previewDistance,
  settings,
  shapeOptions,
}: DesignTabProps) {
  const isImageMode = settings.sourceMode === 'image';

  return (
    <TabContent>
      <Section $first>
        <SectionTitle>Source</SectionTitle>
        <ControlGrid>
          <SelectControl
            onChange={(event) =>
              onSourceModeChange(event.target.value as HalftoneSourceMode)
            }
            options={[
              { label: '3D Shape', value: 'shape' },
              { label: 'Image', value: 'image' },
            ]}
            value={settings.sourceMode}
          >
            Mode
          </SelectControl>

          {isImageMode ? (
            <ShapeRow>
              <span>Image</span>
              <ValueDisplay title={imageFileName ?? 'twenty-logo.svg'}>
                {imageFileName ?? 'twenty-logo.svg'}
              </ValueDisplay>
              <UploadButton
                onClick={onUploadImage}
                title="Upload image (.png / .jpg / .webp)"
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
          ) : (
            <ShapeRow>
              <span>Shape</span>
              <SelectInput
                onChange={(event) => onShapeChange(event.target.value)}
                value={settings.shapeKey}
              >
                {shapeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
              <UploadButton
                onClick={onUploadModel}
                title="Upload model (.fbx / .glb)"
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
          )}
        </ControlGrid>
      </Section>

      {isImageMode ? (
        <>
          <Section>
            <SectionTitle>Visualization</SectionTitle>
            <ControlGrid>
              <SliderControl
                max={8}
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
        </>
      ) : (
        <>
          <Section>
            <SectionTitle>Visualization</SectionTitle>
            <ControlGrid>
              <SliderControl
                max={8}
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
            <SliderControl
              max={150}
              min={30}
              onChange={(event) =>
                onHalftoneChange({ numRows: Number(event.target.value) })
              }
              value={settings.halftone.numRows}
              valueLabel={String(settings.halftone.numRows)}
            >
              Rows
            </SliderControl>
            <SliderControl
              max={3}
              min={0.5}
              onChange={(event) =>
                onHalftoneChange({ contrast: Number(event.target.value) })
              }
              step={0.1}
              value={settings.halftone.contrast}
              valueLabel={formatDecimal(settings.halftone.contrast, 1)}
            >
              Contrast
            </SliderControl>
            <SliderControl
              max={2.5}
              min={0.5}
              onChange={(event) =>
                onHalftoneChange({ power: Number(event.target.value) })
              }
              step={0.1}
              value={settings.halftone.power}
              valueLabel={formatDecimal(settings.halftone.power, 1)}
            >
              Power
            </SliderControl>
            <SliderControl
              max={3}
              min={0}
              onChange={(event) =>
                onHalftoneChange({ shading: Number(event.target.value) })
              }
              step={0.1}
              value={settings.halftone.shading}
              valueLabel={formatDecimal(settings.halftone.shading, 1)}
            >
              Shading
            </SliderControl>
            <SliderControl
              max={0.4}
              min={0}
              onChange={(event) =>
                onHalftoneChange({ baseInk: Number(event.target.value) })
              }
              step={0.01}
              value={settings.halftone.baseInk}
              valueLabel={formatDecimal(settings.halftone.baseInk)}
            >
              Base Density
            </SliderControl>
            <SliderControl
              max={0.4}
              min={0}
              onChange={(event) =>
                onHalftoneChange({ highlightOpen: Number(event.target.value) })
              }
              step={0.01}
              value={settings.halftone.highlightOpen}
              valueLabel={formatDecimal(settings.halftone.highlightOpen)}
            >
              Highlight Open
            </SliderControl>
            <SliderControl
              max={1}
              min={0}
              onChange={(event) =>
                onHalftoneChange({
                  shadowGrouping: Number(event.target.value),
                })
              }
              step={0.01}
              value={settings.halftone.shadowGrouping}
              valueLabel={formatDecimal(settings.halftone.shadowGrouping)}
            >
              Shadow Group
            </SliderControl>
            <SliderControl
              max={0.48}
              min={0.1}
              onChange={(event) =>
                onHalftoneChange({ maxBar: Number(event.target.value) })
              }
              step={0.01}
              value={settings.halftone.maxBar}
              valueLabel={formatDecimal(settings.halftone.maxBar)}
            >
              Thickness
            </SliderControl>
            <SliderControl
              max={0.35}
              min={0}
              onChange={(event) =>
                onHalftoneChange({ rowMerge: Number(event.target.value) })
              }
              step={0.01}
              value={settings.halftone.rowMerge}
              valueLabel={formatDecimal(settings.halftone.rowMerge)}
            >
              Row Merge
            </SliderControl>
          </ControlGrid>
        ) : null}
      </Section>

      <Section>
        <SectionTitle>Colors</SectionTitle>
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

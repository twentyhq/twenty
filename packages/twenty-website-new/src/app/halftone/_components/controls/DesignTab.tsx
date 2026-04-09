'use client';

import {
  formatAmbientIntensity,
  formatAngle,
  formatDecimal,
  formatFillIntensity,
  formatHeight,
  formatLightIntensity,
  formatRows,
} from '@/app/halftone/_lib/formatters';
import type { HalftoneStudioSettings } from '@/app/halftone/_lib/types';
import {
  ColorInput,
  ColorControlLabel,
  ColorControlRow,
  ColorSwatch,
  ControlGrid,
  Section,
  SectionTitle,
  SectionToggleHeader,
  SelectInput,
  ShapeRow,
  SliderControl,
  TabContent,
  UploadButton,
} from './controls-ui';

type DesignTabProps = {
  onDashColorChange: (value: string) => void;
  onHalftoneChange: (value: Partial<HalftoneStudioSettings['halftone']>) => void;
  onLightingChange: (value: Partial<HalftoneStudioSettings['lighting']>) => void;
  onMaterialChange: (value: Partial<HalftoneStudioSettings['material']>) => void;
  onPreviewDistanceChange: (value: number) => void;
  onShapeChange: (value: string) => void;
  onUploadModel: () => void;
  previewDistance: number;
  settings: HalftoneStudioSettings;
  shapeOptions: Array<{ label: string; value: string }>;
};

export function DesignTab({
  onDashColorChange,
  onHalftoneChange,
  onLightingChange,
  onMaterialChange,
  onPreviewDistanceChange,
  onShapeChange,
  onUploadModel,
  previewDistance,
  settings,
  shapeOptions,
}: DesignTabProps) {
  return (
    <TabContent>
      <Section $first>
        <SectionTitle>Model</SectionTitle>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" /></svg>
          </UploadButton>
        </ShapeRow>
      </Section>

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
            valueLabel={formatLightIntensity(settings.lighting.intensity)}
          >
            Light
          </SliderControl>
          <SliderControl
            max={1.5}
            min={0}
            onChange={(event) =>
              onLightingChange({ fillIntensity: Number(event.target.value) })
            }
            step={0.01}
            value={settings.lighting.fillIntensity}
            valueLabel={formatFillIntensity(settings.lighting.fillIntensity)}
          >
            Fill
          </SliderControl>
          <SliderControl
            max={0.3}
            min={0}
            onChange={(event) =>
              onLightingChange({ ambientIntensity: Number(event.target.value) })
            }
            step={0.01}
            value={settings.lighting.ambientIntensity}
            valueLabel={formatAmbientIntensity(settings.lighting.ambientIntensity)}
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
            valueLabel={formatHeight(settings.lighting.height)}
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
              valueLabel={formatRows(settings.halftone.numRows)}
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
              max={3.5}
              min={1}
              onChange={(event) =>
                onHalftoneChange({ cellRatio: Number(event.target.value) })
              }
              step={0.1}
              value={settings.halftone.cellRatio}
              valueLabel={formatDecimal(settings.halftone.cellRatio, 1)}
            >
              Gap
            </SliderControl>
            <SliderControl
              max={0.2}
              min={0}
              onChange={(event) =>
                onHalftoneChange({ cutoff: Number(event.target.value) })
              }
              step={0.01}
              value={settings.halftone.cutoff}
              valueLabel={formatDecimal(settings.halftone.cutoff)}
            >
              Cutoff
            </SliderControl>
          </ControlGrid>
        ) : null}
      </Section>

      <Section>
        <SectionTitle>Colors</SectionTitle>
        <ControlGrid>
          <ColorControlRow>
            <ColorControlLabel>Dash color</ColorControlLabel>
            <ColorSwatch>
              <ColorInput
                onChange={(event) => onDashColorChange(event.target.value)}
                type="color"
                value={settings.halftone.dashColor}
              />
            </ColorSwatch>
          </ColorControlRow>
        </ControlGrid>
      </Section>
    </TabContent>
  );
}

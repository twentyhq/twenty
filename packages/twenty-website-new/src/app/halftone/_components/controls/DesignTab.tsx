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
  ColorItem,
  ColorItemLabel,
  ColorPair,
  ControlGrid,
  SecondaryActionButton,
  Section,
  SectionTitle,
  SelectControl,
  SliderControl,
  TabContent,
  ToggleControl,
} from './controls-ui';

type DesignTabProps = {
  onBackgroundColorChange: (value: string) => void;
  onBackgroundTransparencyChange: (value: boolean) => void;
  onDashColorChange: (value: string) => void;
  onHalftoneChange: (value: Partial<HalftoneStudioSettings['halftone']>) => void;
  onLightingChange: (value: Partial<HalftoneStudioSettings['lighting']>) => void;
  onMaterialChange: (value: Partial<HalftoneStudioSettings['material']>) => void;
  onShapeChange: (value: string) => void;
  onUploadModel: () => void;
  settings: HalftoneStudioSettings;
  shapeOptions: Array<{ label: string; value: string }>;
};

export function DesignTab({
  onBackgroundColorChange,
  onBackgroundTransparencyChange,
  onDashColorChange,
  onHalftoneChange,
  onLightingChange,
  onMaterialChange,
  onShapeChange,
  onUploadModel,
  settings,
  shapeOptions,
}: DesignTabProps) {
  return (
    <TabContent>
      <Section $first>
        <SectionTitle>Model</SectionTitle>
        <ControlGrid>
          <SelectControl
            onChange={(event) => onShapeChange(event.target.value)}
            options={shapeOptions}
            value={settings.shapeKey}
          >
            Shape
          </SelectControl>
          <SecondaryActionButton onClick={onUploadModel} type="button">
            ↑ Upload Model (.fbx / .glb)
          </SecondaryActionButton>
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
        <SectionTitle>Halftone</SectionTitle>
        <ControlGrid>
          <ToggleControl
            checked={settings.halftone.enabled}
            label="Halftone effect"
            onChange={(event) =>
              onHalftoneChange({ enabled: event.target.checked })
            }
          />
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
        </ControlGrid>
      </Section>

      <Section>
        <SectionTitle>Colors</SectionTitle>
        <ControlGrid>
          <ColorPair>
            <ColorItem>
              <ColorItemLabel>Dash color</ColorItemLabel>
              <ColorInput
                onChange={(event) => onDashColorChange(event.target.value)}
                type="color"
                value={settings.halftone.dashColor}
              />
            </ColorItem>
            {!settings.background.transparent ? (
              <ColorItem>
                <ColorItemLabel>Background</ColorItemLabel>
                <ColorInput
                  onChange={(event) =>
                    onBackgroundColorChange(event.target.value)
                  }
                  type="color"
                  value={settings.background.color}
                />
              </ColorItem>
            ) : null}
          </ColorPair>
          <ToggleControl
            checked={settings.background.transparent}
            label="Transparent background"
            onChange={(event) =>
              onBackgroundTransparencyChange(event.target.checked)
            }
          />
        </ControlGrid>
      </Section>
    </TabContent>
  );
}

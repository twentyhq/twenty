'use client';

import type { HalftoneMaterialSettings } from '../../engine/studio-settings-types';

import { HALFTONE_FORMATTERS } from './formatters';
import { SliderControl } from './SliderControl';

type GlassMaterialControlsProps = {
  material: Pick<HalftoneMaterialSettings, 'refraction' | 'thickness'>;
  onMaterialChange: (value: Partial<HalftoneMaterialSettings>) => void;
};

export function GlassMaterialControls({
  material,
  onMaterialChange,
}: GlassMaterialControlsProps) {
  return (
    <>
      <SliderControl
        max={20}
        min={1.1}
        onChange={(event) =>
          onMaterialChange({ thickness: Number(event.target.value) })
        }
        step={0.1}
        value={material.thickness}
        valueLabel={HALFTONE_FORMATTERS.decimal(material.thickness, 0)}
      >
        Thickness
      </SliderControl>
      <SliderControl
        max={3}
        min={1.1}
        onChange={(event) =>
          onMaterialChange({ refraction: Number(event.target.value) })
        }
        step={0.01}
        value={material.refraction}
        valueLabel={HALFTONE_FORMATTERS.decimal(material.refraction)}
      >
        Refraction
      </SliderControl>
    </>
  );
}

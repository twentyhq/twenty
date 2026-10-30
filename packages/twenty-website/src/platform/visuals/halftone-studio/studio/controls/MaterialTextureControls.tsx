'use client';

import { isDefined } from 'twenty-shared/utils';

import type { HalftoneMaterialTexture } from '../../engine/material-texture';
import type { HalftoneMaterialSettings } from '../../engine/studio-settings-types';

import { HALFTONE_FORMATTERS } from './formatters';
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

type MaterialTextureControlsProps = {
  material: Pick<HalftoneMaterialSettings, 'texture' | 'textureTiling'>;
  onMaterialChange: (value: Partial<HalftoneMaterialSettings>) => void;
};

export function MaterialTextureControls({
  material,
  onMaterialChange,
}: MaterialTextureControlsProps) {
  return (
    <>
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
        value={material.texture}
      >
        Texture
      </SelectControl>
      {material.texture !== 'none' ? (
        <SliderControl
          max={16}
          min={1}
          onChange={(event) =>
            onMaterialChange({ textureTiling: Number(event.target.value) })
          }
          step={0.1}
          value={material.textureTiling}
          valueLabel={HALFTONE_FORMATTERS.decimal(material.textureTiling, 1)}
        >
          Tiling
        </SliderControl>
      ) : null}
    </>
  );
}

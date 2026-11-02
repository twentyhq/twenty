import { isDefined } from 'twenty-shared/utils';

import type { HalftoneMaterialTexture } from './material-texture';
import type { HalftoneMaterialTextureImage } from './material-texture-image';
import { HALFTONE_MATERIAL_TEXTURE_LAYERS } from './material-texture-layers';

type MaterialTextureSources<TSource> = {
  bump: TSource | null;
  bumpScale: number;
  roughness: TSource | null;
};

export function resolveMaterialTextureSources<TSource>({
  sources,
  texture,
}: {
  sources: Partial<Record<HalftoneMaterialTextureImage, TSource>>;
  texture: HalftoneMaterialTexture;
}): MaterialTextureSources<TSource> {
  if (texture === 'none') {
    return { bump: null, bumpScale: 0, roughness: null };
  }

  const layers = HALFTONE_MATERIAL_TEXTURE_LAYERS[texture];
  const bump = isDefined(layers.bumpImage)
    ? (sources[layers.bumpImage] ?? null)
    : null;

  return {
    bump,
    bumpScale: isDefined(bump) ? layers.bumpScale : 0,
    roughness: sources[layers.roughnessImage] ?? null,
  };
}

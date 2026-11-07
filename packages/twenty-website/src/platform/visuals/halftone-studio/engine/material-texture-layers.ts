import type { HalftoneMaterialTextureImage } from './material-texture-image';
import type { HalftoneMaterialTexturePattern } from './material-texture-pattern';

type HalftoneMaterialTextureLayers = {
  roughnessImage: HalftoneMaterialTextureImage;
  bumpImage: HalftoneMaterialTextureImage | null;
  bumpScale: number;
};

export const HALFTONE_MATERIAL_TEXTURE_LAYERS: Record<
  HalftoneMaterialTexturePattern,
  HalftoneMaterialTextureLayers
> = {
  smudged: { roughnessImage: 'smudged', bumpImage: null, bumpScale: 0 },
  worn: { roughnessImage: 'worn', bumpImage: 'dents', bumpScale: 3 },
  hammered: {
    roughnessImage: 'hammered',
    bumpImage: 'hammered',
    bumpScale: 0.6,
  },
  brushed: { roughnessImage: 'brushed', bumpImage: 'brushed', bumpScale: 0.6 },
};

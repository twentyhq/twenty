import type { HalftoneTextureImage } from './material-texture-image';
import type { HalftoneTexturePattern } from './material-texture-pattern';

type HalftoneTextureLayers = {
  roughnessImage: HalftoneTextureImage;
  bumpImage: HalftoneTextureImage | null;
  bumpScale: number;
};

export const HALFTONE_MATERIAL_TEXTURE_LAYERS: Record<
  HalftoneTexturePattern,
  HalftoneTextureLayers
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

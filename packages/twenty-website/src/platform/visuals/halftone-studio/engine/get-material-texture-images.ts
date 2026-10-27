import { isDefined } from 'twenty-shared/utils';

import type { HalftoneMaterialTexture } from './material-texture';
import type { HalftoneMaterialTextureImage } from './material-texture-image';
import { HALFTONE_MATERIAL_TEXTURE_LAYERS } from './material-texture-layers';

export function getMaterialTextureImages(
  texture: HalftoneMaterialTexture,
): HalftoneMaterialTextureImage[] {
  if (texture === 'none') {
    return [];
  }

  const { bumpImage, roughnessImage } =
    HALFTONE_MATERIAL_TEXTURE_LAYERS[texture];

  return isDefined(bumpImage) && bumpImage !== roughnessImage
    ? [roughnessImage, bumpImage]
    : [roughnessImage];
}

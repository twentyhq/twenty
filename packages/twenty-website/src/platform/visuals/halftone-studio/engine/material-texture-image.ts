import type { HALFTONE_MATERIAL_IMAGE_URLS } from './material-image-urls';

export type HalftoneMaterialTextureImage =
  keyof (typeof HALFTONE_MATERIAL_IMAGE_URLS)['textures'];

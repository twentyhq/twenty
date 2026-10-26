import type { HalftoneMaterialTexture } from './material-texture';

export type HalftoneMaterialTexturePattern = Exclude<
  HalftoneMaterialTexture,
  'none'
>;

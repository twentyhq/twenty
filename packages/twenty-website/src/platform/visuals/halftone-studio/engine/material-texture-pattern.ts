import type { HalftoneMaterialTexture } from './material-texture';

export type HalftoneTexturePattern = Exclude<HalftoneMaterialTexture, 'none'>;

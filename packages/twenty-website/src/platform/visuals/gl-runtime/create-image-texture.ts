import { Texture } from 'ogl';

import { type VisualRenderingContext } from './create-visual-renderer';

// three uploaded sRGB-tagged textures as SRGB8_ALPHA8, so the sampler
// returned linear values and every downstream shader constant was authored
// against that. ogl defaults to RGBA8, which would hand the same shaders
// gamma-encoded input.
export function createImageTexture(
  gl: VisualRenderingContext,
  image: HTMLImageElement,
) {
  return new Texture(gl, {
    image,
    format: gl.RGBA,
    internalFormat: WebGL2RenderingContext.SRGB8_ALPHA8,
    type: gl.UNSIGNED_BYTE,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    generateMipmaps: false,
  });
}

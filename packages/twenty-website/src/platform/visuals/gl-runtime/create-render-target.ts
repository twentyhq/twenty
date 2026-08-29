import { RenderTarget } from 'ogl';

import { type VisualRenderingContext } from './create-visual-renderer';

type CreateRenderTargetOptions = {
  depth?: boolean;
};

// The linear RGBA target every halftone pass renders into.
export function createRenderTarget(
  gl: VisualRenderingContext,
  width: number,
  height: number,
  { depth = true }: CreateRenderTargetOptions = {},
) {
  return new RenderTarget(gl, {
    width,
    height,
    depth,
    format: gl.RGBA,
    internalFormat: WebGL2RenderingContext.RGBA8,
    type: gl.UNSIGNED_BYTE,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
  });
}

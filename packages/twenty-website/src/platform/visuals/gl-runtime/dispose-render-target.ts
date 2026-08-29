import { type RenderTarget } from 'ogl';

import { type VisualRenderingContext } from './create-visual-renderer';

// ogl leaves render target teardown to the caller: the framebuffer, every
// colour attachment and the depth renderbuffer are all separate GL objects.
export function disposeRenderTarget(
  gl: VisualRenderingContext,
  target: RenderTarget,
) {
  target.textures.forEach((texture) => gl.deleteTexture(texture.texture));
  if (target.depthTexture) {
    gl.deleteTexture(target.depthTexture.texture);
  }
  if (target.depthBuffer) {
    gl.deleteRenderbuffer(target.depthBuffer);
  }
  if (target.stencilBuffer) {
    gl.deleteRenderbuffer(target.stencilBuffer);
  }
  if (target.depthStencilBuffer) {
    gl.deleteRenderbuffer(target.depthStencilBuffer);
  }
  gl.deleteFramebuffer(target.buffer);
}

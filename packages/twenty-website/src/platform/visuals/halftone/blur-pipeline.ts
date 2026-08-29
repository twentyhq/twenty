import { type Texture, Vec2 } from 'ogl';

import { createFullscreenPass } from '../gl-runtime/create-fullscreen-pass';
import { createRenderTarget } from '../gl-runtime/create-render-target';
import {
  type VisualRenderer,
  type VisualRenderingContext,
} from '../gl-runtime/create-visual-renderer';
import { disposeRenderTarget } from '../gl-runtime/dispose-render-target';
import { BLUR_PASS_SHADERS } from './blur-pass-shaders';

type BlurPipeline = {
  setSize: (width: number, height: number) => void;
  // Two gaussian passes each way: input -> A -> B -> A -> B; the result
  // lives in targetB (the glow buffer the composites sample).
  render: (renderer: VisualRenderer, inputTexture: Texture) => void;
  getGlowTexture: () => Texture;
  dispose: () => void;
};

// The double gaussian blur chain shared by every glow-sampling composite
// (rows sessions, the transmission materials).
export function createBlurPipeline(
  gl: VisualRenderingContext,
  width: number,
  height: number,
): BlurPipeline {
  const targetA = createRenderTarget(gl, width, height, { depth: false });
  const targetB = createRenderTarget(gl, width, height, { depth: false });

  const createPass = (directionX: number, directionY: number) => {
    // tInput is rebound to a different target on each of the four passes, so
    // it has to be declared wider than the null it starts as.
    const uniforms: {
      dir: { value: Vec2 };
      res: { value: Vec2 };
      tInput: { value: Texture | null };
    } = {
      dir: { value: new Vec2(directionX, directionY) },
      res: { value: new Vec2(width, height) },
      tInput: { value: null },
    };

    return createFullscreenPass({
      gl,
      vertex: BLUR_PASS_SHADERS.vertex,
      fragment: BLUR_PASS_SHADERS.fragment,
      uniforms,
    });
  };

  const horizontalPass = createPass(1, 0);
  const verticalPass = createPass(0, 1);

  return {
    setSize: (nextWidth, nextHeight) => {
      targetA.setSize(nextWidth, nextHeight);
      targetB.setSize(nextWidth, nextHeight);
      horizontalPass.uniforms.res.value.set(nextWidth, nextHeight);
      verticalPass.uniforms.res.value.set(nextWidth, nextHeight);
    },
    render: (renderer, inputTexture) => {
      horizontalPass.uniforms.tInput.value = inputTexture;
      renderer.render({ scene: horizontalPass.mesh, target: targetA });
      verticalPass.uniforms.tInput.value = targetA.texture;
      renderer.render({ scene: verticalPass.mesh, target: targetB });
      horizontalPass.uniforms.tInput.value = targetB.texture;
      renderer.render({ scene: horizontalPass.mesh, target: targetA });
      verticalPass.uniforms.tInput.value = targetA.texture;
      renderer.render({ scene: verticalPass.mesh, target: targetB });
    },
    getGlowTexture: () => targetB.texture,
    dispose: () => {
      horizontalPass.dispose();
      verticalPass.dispose();
      disposeRenderTarget(gl, targetA);
      disposeRenderTarget(gl, targetB);
    },
  };
}

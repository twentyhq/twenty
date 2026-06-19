import * as THREE from 'three';

import { BLUR_PASS_SHADERS } from './blur-pass-shaders';

type BlurPipeline = {
  setSize: (width: number, height: number) => void;
  // Two gaussian passes each way: input -> A -> B -> A -> B; the result
  // lives in targetB (the glow buffer the composites sample).
  render: (
    renderer: THREE.WebGLRenderer,
    inputTexture: THREE.Texture,
    camera: THREE.Camera,
  ) => void;
  targetB: THREE.WebGLRenderTarget;
  dispose: () => void;
};

// The double gaussian blur chain shared by every glow-sampling composite
// (rows sessions, the transmission materials).
export function createBlurPipeline(
  width: number,
  height: number,
): BlurPipeline {
  const createTarget = (targetWidth: number, targetHeight: number) =>
    new THREE.WebGLRenderTarget(targetWidth, targetHeight, {
      format: THREE.RGBAFormat,
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
    });

  const targetA = createTarget(width, height);
  const targetB = createTarget(width, height);

  const createMaterial = (directionX: number, directionY: number) =>
    new THREE.ShaderMaterial({
      uniforms: {
        dir: { value: new THREE.Vector2(directionX, directionY) },
        res: { value: new THREE.Vector2(width, height) },
        tInput: { value: null },
      },
      vertexShader: BLUR_PASS_SHADERS.vertex,
      fragmentShader: BLUR_PASS_SHADERS.fragment,
    });

  const horizontalMaterial = createMaterial(1, 0);
  const verticalMaterial = createMaterial(0, 1);

  const geometry = new THREE.PlaneGeometry(2, 2);
  const horizontalScene = new THREE.Scene();
  horizontalScene.add(new THREE.Mesh(geometry, horizontalMaterial));
  const verticalScene = new THREE.Scene();
  verticalScene.add(new THREE.Mesh(geometry, verticalMaterial));

  return {
    setSize: (nextWidth, nextHeight) => {
      targetA.setSize(nextWidth, nextHeight);
      targetB.setSize(nextWidth, nextHeight);
      horizontalMaterial.uniforms.res.value.set(nextWidth, nextHeight);
      verticalMaterial.uniforms.res.value.set(nextWidth, nextHeight);
    },
    render: (renderer, inputTexture, camera) => {
      horizontalMaterial.uniforms.tInput.value = inputTexture;
      renderer.setRenderTarget(targetA);
      renderer.render(horizontalScene, camera);
      verticalMaterial.uniforms.tInput.value = targetA.texture;
      renderer.setRenderTarget(targetB);
      renderer.render(verticalScene, camera);
      horizontalMaterial.uniforms.tInput.value = targetB.texture;
      renderer.setRenderTarget(targetA);
      renderer.render(horizontalScene, camera);
      verticalMaterial.uniforms.tInput.value = targetA.texture;
      renderer.setRenderTarget(targetB);
      renderer.render(verticalScene, camera);
    },
    targetB,
    dispose: () => {
      horizontalMaterial.dispose();
      verticalMaterial.dispose();
      geometry.dispose();
      targetA.dispose();
      targetB.dispose();
    },
  };
}

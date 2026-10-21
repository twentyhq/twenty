import * as THREE from 'three';

export function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });
}

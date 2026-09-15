import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// The PMREM room environment the solid materials reflect. Caller owns
// disposal of the returned texture.
export function createEnvironmentTexture(renderer: THREE.WebGLRenderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();
  return environmentTexture;
}

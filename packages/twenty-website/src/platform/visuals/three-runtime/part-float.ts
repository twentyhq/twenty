import type * as THREE from 'three';

import { type GeometryPart } from './load-glb-geometry';

// Floats the models of a composed GLB one by one: the same amplitude, each
// at its own pace and phase, so a row of models never moves as one block.
// Moves the geometry's own vertices: give it a geometry of its own, not the
// loader's cached one.
export function createPartFloat(
  geometry: THREE.BufferGeometry,
  parts: readonly GeometryPart[],
): (phase: number, amplitude: number) => void {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const array = position.array as Float32Array;
  const restHeights = parts.map(({ start, count }) =>
    Float32Array.from(
      { length: count },
      (_, index) => array[(start + index) * 3 + 1],
    ),
  );

  return (phase, amplitude) => {
    parts.forEach(({ start, count }, partIndex) => {
      const offset =
        Math.sin(phase * (1 + partIndex * 0.23) + partIndex * 2.1) * amplitude;
      const rest = restHeights[partIndex];
      for (let index = 0; index < count; index += 1) {
        array[(start + index) * 3 + 1] = rest[index] + offset;
      }
    });
    position.needsUpdate = true;
  };
}

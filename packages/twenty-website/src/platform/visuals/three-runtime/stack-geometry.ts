import * as THREE from 'three';

import { mergeGeometries } from '../halftone-studio/engine/merge-geometries';

// One copy of a model in a stack. The model is laid flat (its face up), then
// placed in its own units: x and z in widths, y in thicknesses.
export type HalftoneModelStackPlacement = {
  x: number;
  y: number;
  z: number;
};

export type HalftoneModelStack = {
  // In draw order: the first `visible` copies are the ones shown.
  placements: readonly HalftoneModelStackPlacement[];
  visible: number;
  // How far the whole stack leans toward the camera, in radians, so the
  // copies' faces read from the front.
  tilt: number;
};

export type StackedGeometry = {
  geometry: THREE.BufferGeometry;
  // Shows the first `count` copies: new ones drop in from above, settling
  // with a small overshoot; removed ones fly off upward, faster.
  setVisible: (count: number, animate: boolean) => void;
  dispose: () => void;
};

// The motion, in the scene's thicknesses and milliseconds.
const DROP = { height: 6, ms: 380, staggerMs: 22, fromScale: 0.85 };
const LEAVE = { height: 5, ms: 260, staggerMs: 14 };

const easeOutBack = (t: number): number => {
  const overshoot = 1.4;
  const shifted = t - 1;
  return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
};
const easeInQuad = (t: number): number => t * t;

// The way the model's face looks: its normals averaged over the side that
// faces the camera (the loader turns a flat model's thinnest side that way),
// so a model authored at an angle still lies flat.
function faceNormal(geometry: THREE.BufferGeometry): THREE.Vector3 {
  const normals = geometry.attributes.normal;
  const sum = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let index = 0; index < normals.count; index += 1) {
    normal.fromBufferAttribute(normals, index);
    if (normal.z > 0.9) {
      sum.add(normal);
    }
  }

  return sum.lengthSq() > 0 ? sum.normalize() : new THREE.Vector3(0, 0, 1);
}

type CopyMotion = {
  from: 'drop' | 'leave';
  startedAt: number;
};

// Many copies of one model in a single geometry, so one halftone canvas draws
// them all. Showing more or fewer is a draw range plus each moving copy's own
// vertices, not a new scene.
export function stackGeometry(
  base: THREE.BufferGeometry,
  { placements, tilt }: Pick<HalftoneModelStack, 'placements' | 'tilt'>,
): StackedGeometry {
  const flat = base.clone();
  flat.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(
      faceNormal(flat),
      new THREE.Vector3(0, 1, 0),
    ),
  );
  flat.computeBoundingBox();
  const size = new THREE.Vector3();
  flat.boundingBox?.getSize(size);
  const flatCenter = new THREE.Vector3();
  flat.boundingBox?.getCenter(flatCenter);

  const copies = placements.map(({ x, y, z }) =>
    flat.clone().translate(x * size.x, y * size.y, z * size.z),
  );
  const geometry = mergeGeometries(copies);
  copies.forEach((copy) => copy.dispose());

  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  geometry.boundingBox?.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);
  geometry.rotateX(tilt);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  // room for a copy dropping in from above
  if (geometry.boundingSphere !== null) {
    geometry.boundingSphere.radius += DROP.height * size.y;
  }

  const indicesPerCopy = flat.index?.count ?? flat.attributes.position.count;
  const verticesPerCopy = flat.attributes.position.count;
  flat.dispose();

  const position = geometry.attributes.position as THREE.BufferAttribute;
  const rest = Float32Array.from(position.array as ArrayLike<number>);
  const up = new THREE.Vector3(0, 1, 0).applyAxisAngle(
    new THREE.Vector3(1, 0, 0),
    tilt,
  );
  const copyCenters = placements.map(({ x, y, z }) =>
    flatCenter
      .clone()
      .add(new THREE.Vector3(x * size.x, y * size.y, z * size.z))
      .sub(center)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), tilt),
  );

  // Moves one copy's vertices: scaled about its centre, lifted along the
  // stack's up.
  const placeCopy = (copyIndex: number, scale: number, lift: number) => {
    const copyCenter = copyCenters[copyIndex];
    const array = position.array as Float32Array;
    const offsetX = up.x * lift * size.y;
    const offsetY = up.y * lift * size.y;
    const offsetZ = up.z * lift * size.y;
    const start = copyIndex * verticesPerCopy * 3;
    const end = start + verticesPerCopy * 3;

    for (let index = start; index < end; index += 3) {
      array[index] =
        copyCenter.x + (rest[index] - copyCenter.x) * scale + offsetX;
      array[index + 1] =
        copyCenter.y + (rest[index + 1] - copyCenter.y) * scale + offsetY;
      array[index + 2] =
        copyCenter.z + (rest[index + 2] - copyCenter.z) * scale + offsetZ;
    }
  };

  const motions = new Map<number, CopyMotion>();
  let shown = 0;
  let frameId: number | null = null;

  const drawnCount = () =>
    Math.max(
      shown,
      ...[...motions.entries()]
        .filter(([, motion]) => motion.from === 'leave')
        .map(([copyIndex]) => copyIndex + 1),
    );

  const step = (now: number) => {
    frameId = null;
    motions.forEach((motion, copyIndex) => {
      const duration = motion.from === 'drop' ? DROP.ms : LEAVE.ms;
      const t = Math.min(Math.max((now - motion.startedAt) / duration, 0), 1);

      if (motion.from === 'drop') {
        const eased = easeOutBack(t);
        placeCopy(
          copyIndex,
          DROP.fromScale + (1 - DROP.fromScale) * Math.min(t * 2, 1),
          (1 - eased) * DROP.height,
        );
      } else {
        placeCopy(
          copyIndex,
          Math.max(1 - t ** 3, 0.001),
          easeInQuad(t) * LEAVE.height,
        );
      }

      if (t >= 1) {
        motions.delete(copyIndex);
        if (motion.from === 'leave') {
          placeCopy(copyIndex, 1, 0);
        }
      }
    });
    position.needsUpdate = true;
    geometry.setDrawRange(0, drawnCount() * indicesPerCopy);

    if (motions.size > 0) {
      frameId = requestAnimationFrame(step);
    }
  };

  const setVisible = (count: number, animate: boolean) => {
    const next = Math.min(Math.max(Math.round(count), 0), placements.length);
    const now = performance.now();

    if (!animate) {
      motions.clear();
      for (let copyIndex = 0; copyIndex < placements.length; copyIndex += 1) {
        placeCopy(copyIndex, 1, 0);
      }
      shown = next;
      position.needsUpdate = true;
      geometry.setDrawRange(0, shown * indicesPerCopy);
      return;
    }

    for (let copyIndex = shown; copyIndex < next; copyIndex += 1) {
      placeCopy(copyIndex, DROP.fromScale, DROP.height);
      motions.set(copyIndex, {
        from: 'drop',
        startedAt: now + (copyIndex - shown) * DROP.staggerMs,
      });
    }
    for (let copyIndex = shown - 1; copyIndex >= next; copyIndex -= 1) {
      motions.set(copyIndex, {
        from: 'leave',
        startedAt: now + (shown - 1 - copyIndex) * LEAVE.staggerMs,
      });
    }
    shown = next;

    if (frameId === null) {
      frameId = requestAnimationFrame(step);
    }
  };

  return {
    geometry,
    setVisible,
    dispose: () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      geometry.dispose();
    },
  };
}

import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type HalftoneModelLoader = 'fbx' | 'glb';

interface HalftoneGeometrySpec {
  key: string;
  label: string;
  kind: 'builtin' | 'imported';
  loader?: HalftoneModelLoader;
  filename?: string;
  description?: string;
  extensions?: readonly string[];
  userProvided?: boolean;
}

type GeometryCacheEntry = THREE.BufferGeometry | Promise<THREE.BufferGeometry>;

function mergeGeometries(geometries: THREE.BufferGeometry[]) {
  if (geometries.length === 1) {
    return geometries[0];
  }

  let totalVertices = 0;
  let totalIndices = 0;
  let hasUv = false;

  const geometryInfos = geometries.map((geometry) => {
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const uv = geometry.attributes.uv ?? null;
    const index = geometry.index;
    const indexCount = index ? index.count : position.count;

    totalVertices += position.count;
    totalIndices += indexCount;
    hasUv = hasUv || uv !== null;

    return {
      index,
      indexCount,
      normal,
      position,
      uv,
      vertexCount: position.count,
    };
  });

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const uvs = hasUv ? new Float32Array(totalVertices * 2) : null;
  const indices = new Uint32Array(totalIndices);

  let vertexOffset = 0;
  let indexOffset = 0;

  for (const geometryInfo of geometryInfos) {
    for (
      let vertexIndex = 0;
      vertexIndex < geometryInfo.vertexCount;
      vertexIndex += 1
    ) {
      const positionOffset = (vertexOffset + vertexIndex) * 3;
      positions[positionOffset] = geometryInfo.position.getX(vertexIndex);
      positions[positionOffset + 1] = geometryInfo.position.getY(vertexIndex);
      positions[positionOffset + 2] = geometryInfo.position.getZ(vertexIndex);
      normals[positionOffset] = geometryInfo.normal.getX(vertexIndex);
      normals[positionOffset + 1] = geometryInfo.normal.getY(vertexIndex);
      normals[positionOffset + 2] = geometryInfo.normal.getZ(vertexIndex);

      if (uvs !== null) {
        const uvOffset = (vertexOffset + vertexIndex) * 2;
        uvs[uvOffset] = geometryInfo.uv?.getX(vertexIndex) ?? 0;
        uvs[uvOffset + 1] = geometryInfo.uv?.getY(vertexIndex) ?? 0;
      }
    }

    if (geometryInfo.index) {
      for (
        let localIndex = 0;
        localIndex < geometryInfo.indexCount;
        localIndex += 1
      ) {
        indices[indexOffset + localIndex] =
          geometryInfo.index.getX(localIndex) + vertexOffset;
      }
    } else {
      for (
        let localIndex = 0;
        localIndex < geometryInfo.indexCount;
        localIndex += 1
      ) {
        indices[indexOffset + localIndex] = localIndex + vertexOffset;
      }
    }

    vertexOffset += geometryInfo.vertexCount;
    indexOffset += geometryInfo.indexCount;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

  if (uvs !== null) {
    merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  merged.setIndex(new THREE.BufferAttribute(indices, 1));

  return merged;
}

const DRACO_DECODER_PATH =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';

function normalizeImportedGeometry(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();

  let boundingBox = geometry.boundingBox;
  let center = new THREE.Vector3();
  let size = new THREE.Vector3();

  boundingBox?.getCenter(center);
  boundingBox?.getSize(size);
  geometry.translate(-center.x, -center.y, -center.z);

  const dimensions = [size.x, size.y, size.z];
  const thinnestAxis = dimensions.indexOf(Math.min(...dimensions));

  if (thinnestAxis === 0) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
  } else if (thinnestAxis === 1) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const radius = geometry.boundingSphere?.radius || 1;
  const scale = 1.6 / radius;
  geometry.scale(scale, scale, scale);

  geometry.computeBoundingBox();
  boundingBox = geometry.boundingBox;
  center = new THREE.Vector3();
  boundingBox?.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

function createLoadingManager() {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) =>
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(url) ? EMPTY_TEXTURE_DATA_URL : url,
  );

  return loadingManager;
}

function extractMergedGeometry(root: THREE.Object3D, emptyMessage: string) {
  root.updateMatrixWorld(true);

  const geometries: THREE.BufferGeometry[] = [];

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || !object.geometry) {
      return;
    }

    const geometry = object.geometry.clone();

    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }

    geometry.applyMatrix4(object.matrixWorld);
    geometries.push(geometry);
  });

  if (geometries.length === 0) {
    throw new Error(emptyMessage);
  }

  return normalizeImportedGeometry(mergeGeometries(geometries));
}

function parseFbxGeometry(
  buffer: ArrayBuffer,
  resourcePath: string,
  label: string,
) {
  const originalWarn = console.warn;

  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('THREE.FBXLoader:')) {
      return;
    }

    originalWarn(...args);
  };

  try {
    const root = new FBXLoader(createLoadingManager()).parse(
      buffer,
      resourcePath,
    );

    return extractMergedGeometry(
      root,
      `${label} did not contain any mesh geometry.`,
    );
  } finally {
    console.warn = originalWarn;
  }
}

function parseGlbGeometry(
  buffer: ArrayBuffer,
  resourcePath: string,
  label: string,
) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

  const gltfLoader = new GLTFLoader(createLoadingManager());
  gltfLoader.setDRACOLoader(dracoLoader);

  return new Promise<THREE.BufferGeometry>((resolve, reject) => {
    gltfLoader.parse(
      buffer,
      resourcePath,
      (gltf) => {
        try {
          resolve(
            extractMergedGeometry(
              gltf.scene,
              `${label} did not contain any mesh geometry.`,
            ),
          );
        } catch (error) {
          reject(error);
        }
      },
      reject,
    );
  }).finally(() => {
    dracoLoader.dispose();
  });
}

async function loadImportedGeometry(
  loader: HalftoneModelLoader,
  file: File,
  label: string,
) {
  const buffer = await file.arrayBuffer();

  if (loader === 'fbx') {
    return parseFbxGeometry(buffer, '', label);
  }

  return parseGlbGeometry(buffer, '', label);
}

export async function loadImportedGeometryFromUrl(
  loader: HalftoneModelLoader,
  modelUrl: string,
  label: string,
) {
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error(`Unable to load ${label} from ${modelUrl}.`);
  }

  const buffer = await response.arrayBuffer();

  if (loader === 'fbx') {
    return parseFbxGeometry(buffer, '', label);
  }

  return parseGlbGeometry(buffer, '', label);
}

function makePolarShape(
  radiusFunction: (angle: number) => number,
  segments = 320,
) {
  const shape = new THREE.Shape();

  for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
    const angle = (segmentIndex / segments) * Math.PI * 2;
    const radius = radiusFunction(angle);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (segmentIndex === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  return shape;
}

function makeReliefGeometry(
  shape: THREE.Shape,
  options: {
    depth?: number;
    bevelSize?: number;
    bevelThickness?: number;
    bevelSegments?: number;
    waves?: number;
    waveDepth?: number;
  } = {},
) {
  const {
    bevelSegments = 8,
    bevelSize = 0.08,
    bevelThickness = 0.1,
    depth = 0.58,
    waveDepth = 0.016,
    waves = 8,
  } = options;

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 2,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments,
    curveSegments: 96,
  });

  geometry.center();

  const position = geometry.attributes.position;
  let maxRadius = 0;

  for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += 1) {
    maxRadius = Math.max(
      maxRadius,
      Math.hypot(position.getX(vertexIndex), position.getY(vertexIndex)),
    );
  }

  const fullDepth = depth + bevelThickness * 2;

  for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += 1) {
    const x = position.getX(vertexIndex);
    const y = position.getY(vertexIndex);
    const z = position.getZ(vertexIndex);
    const radius = Math.hypot(x, y) / maxRadius;
    const angle = Math.atan2(y, x);
    const faceAmount = Math.min(1, Math.abs(z) / (fullDepth * 0.5));
    const rimLift = Math.exp(-Math.pow((radius - 0.84) / 0.12, 2));
    const innerDish = Math.exp(-Math.pow((radius - 0.42) / 0.2, 2));
    const wave =
      Math.cos(angle * waves) *
      Math.exp(-Math.pow((radius - 0.72) / 0.16, 2)) *
      waveDepth;
    const relief = faceAmount * (0.14 * rimLift - 0.055 * innerDish + wave);

    position.setZ(vertexIndex, z + (z >= 0 ? 1 : -1) * relief);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

function makeArrowTarget() {
  const targetParts: THREE.BufferGeometry[] = [];
  const arrowParts: THREE.BufferGeometry[] = [];
  const baseRadius = 1.35;
  const baseDepth = 0.32;
  const bevel = 0.12;
  const points: THREE.Vector2[] = [];
  const segments = 16;

  points.push(new THREE.Vector2(0, -baseDepth / 2));
  points.push(new THREE.Vector2(baseRadius - bevel, -baseDepth / 2));

  for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
    const angle = Math.PI / 2 + (segmentIndex / segments) * (Math.PI / 2);
    points.push(
      new THREE.Vector2(
        baseRadius - bevel + Math.cos(angle) * bevel,
        -baseDepth / 2 + bevel + Math.sin(angle) * bevel,
      ),
    );
  }

  points.push(new THREE.Vector2(baseRadius, baseDepth / 2 - bevel));

  for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
    const angle = (segmentIndex / segments) * (Math.PI / 2);
    points.push(
      new THREE.Vector2(
        baseRadius - bevel + Math.cos(angle) * bevel,
        baseDepth / 2 - bevel + Math.sin(angle) * bevel,
      ),
    );
  }

  points.push(new THREE.Vector2(0, baseDepth / 2));

  const disc = new THREE.LatheGeometry(points, 64);
  disc.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  targetParts.push(disc);

  for (const radius of [0.45, 0.85, 1.22]) {
    const ring = new THREE.TorusGeometry(radius, 0.14, 16, 64);
    ring.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2 + 0.04),
    );
    targetParts.push(ring);
  }

  const bump = new THREE.SphereGeometry(
    0.32,
    32,
    24,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2,
  );
  bump.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  bump.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2));
  targetParts.push(bump);

  const shaftLength = 1.5;
  const shaftRadius = 0.05;
  const shaft = new THREE.CylinderGeometry(
    shaftRadius,
    shaftRadius,
    shaftLength,
    10,
    1,
  );
  shaft.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, shaftLength / 2, 0),
  );
  arrowParts.push(shaft);

  const head = new THREE.ConeGeometry(0.12, 0.35, 10);
  head.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.15, 0));
  arrowParts.push(head);

  for (let finIndex = 0; finIndex < 3; finIndex += 1) {
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.22, 0.25);
    finShape.lineTo(0, 0.5);
    finShape.lineTo(0, 0);

    const finGeometry = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.012,
      bevelEnabled: false,
    });

    finGeometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0.05, 0, -0.006),
    );
    finGeometry.applyMatrix4(
      new THREE.Matrix4().makeRotationY((finIndex * Math.PI * 2) / 3),
    );
    finGeometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, shaftLength - 0.45, 0),
    );
    arrowParts.push(finGeometry);
  }

  const nock = new THREE.SphereGeometry(0.065, 8, 8);
  nock.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, shaftLength + 0.03, 0),
  );
  arrowParts.push(nock);

  const aim = new THREE.Matrix4().makeRotationX(Math.PI / 2.15);
  const tilt = new THREE.Matrix4().makeRotationZ(Math.PI / 5);
  const shift = new THREE.Matrix4().makeTranslation(0.15, 0.15, 0.12);

  for (const geometry of arrowParts) {
    geometry.applyMatrix4(aim);
    geometry.applyMatrix4(tilt);
    geometry.applyMatrix4(shift);
  }

  const merged = mergeGeometries([...targetParts, ...arrowParts]);
  merged.computeVertexNormals();
  merged.computeBoundingSphere();

  return merged;
}

function makeDollarCoin() {
  const parts: THREE.BufferGeometry[] = [];
  const baseRadius = 1.3;
  const baseDepth = 0.45;
  const bevel = 0.18;
  const points: THREE.Vector2[] = [];
  const segments = 20;

  points.push(new THREE.Vector2(0, -baseDepth / 2));
  points.push(new THREE.Vector2(baseRadius - bevel, -baseDepth / 2));

  for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
    const angle = -Math.PI / 2 + (segmentIndex / segments) * Math.PI;
    points.push(
      new THREE.Vector2(
        baseRadius - bevel + Math.cos(angle) * bevel,
        Math.sin(angle) * (baseDepth / 2),
      ),
    );
  }

  points.push(new THREE.Vector2(baseRadius - bevel, baseDepth / 2));
  points.push(new THREE.Vector2(0, baseDepth / 2));

  const disc = new THREE.LatheGeometry(points, 64);
  disc.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  parts.push(disc);

  const frontRim = new THREE.TorusGeometry(baseRadius - 0.22, 0.05, 12, 64);
  frontRim.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2 - 0.01),
  );
  parts.push(frontRim);

  const backRim = new THREE.TorusGeometry(baseRadius - 0.22, 0.05, 12, 64);
  backRim.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, 0, -(baseDepth / 2 - 0.01)),
  );
  parts.push(backRim);

  const createDollarSign = () => {
    const geometries: THREE.BufferGeometry[] = [];
    const tubeRadius = 0.1;
    const curveRadius = 0.28;
    const verticalOffset = 0.22;

    const bar = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 12);
    geometries.push(bar);

    const topArc = new THREE.TorusGeometry(
      curveRadius,
      tubeRadius,
      16,
      32,
      Math.PI,
    );
    topArc.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    topArc.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0.05, verticalOffset, 0),
    );
    geometries.push(topArc);

    const bottomArc = new THREE.TorusGeometry(
      curveRadius,
      tubeRadius,
      16,
      32,
      Math.PI,
    );
    bottomArc.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    bottomArc.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-0.05, -verticalOffset, 0),
    );
    geometries.push(bottomArc);

    const topSerif = new THREE.CylinderGeometry(
      tubeRadius,
      tubeRadius,
      0.22,
      12,
    );
    topSerif.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    topSerif.applyMatrix4(
      new THREE.Matrix4().makeTranslation(
        0.16,
        verticalOffset + curveRadius,
        0,
      ),
    );
    geometries.push(topSerif);

    const bottomSerif = new THREE.CylinderGeometry(
      tubeRadius,
      tubeRadius,
      0.22,
      12,
    );
    bottomSerif.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    bottomSerif.applyMatrix4(
      new THREE.Matrix4().makeTranslation(
        -0.16,
        -verticalOffset - curveRadius,
        0,
      ),
    );
    geometries.push(bottomSerif);

    const diagonalLength = Math.sqrt(0.1 * 0.1 + (verticalOffset * 2) ** 2);
    const diagonalAngle = Math.atan2(verticalOffset * 2, 0.1);
    const diagonal = new THREE.CylinderGeometry(
      tubeRadius,
      tubeRadius,
      diagonalLength + 0.12,
      12,
    );
    diagonal.applyMatrix4(
      new THREE.Matrix4().makeRotationZ(diagonalAngle - Math.PI / 2),
    );
    geometries.push(diagonal);

    return geometries;
  };

  for (const geometry of createDollarSign()) {
    geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2 + 0.01),
    );
    parts.push(geometry);
  }

  for (const geometry of createDollarSign()) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));
    geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, -(baseDepth / 2 + 0.01)),
    );
    parts.push(geometry);
  }

  const merged = mergeGeometries(parts);
  merged.computeVertexNormals();
  merged.computeBoundingSphere();

  return merged;
}

const BUILTIN_GEOMETRIES: Record<string, () => THREE.BufferGeometry> = {
  torusKnot: () => new THREE.TorusKnotGeometry(1, 0.35, 200, 32),
  sphere: () => new THREE.SphereGeometry(1.4, 64, 64),
  torus: () => new THREE.TorusGeometry(1, 0.45, 64, 100),
  icosahedron: () => new THREE.IcosahedronGeometry(1.4, 4),
  box: () => new THREE.BoxGeometry(2.1, 2.1, 2.1, 6, 6, 6),
  cone: () => new THREE.ConeGeometry(1.2, 2.4, 64, 10),
  cylinder: () => new THREE.CylinderGeometry(1, 1, 2.3, 64, 10),
  octahedron: () => new THREE.OctahedronGeometry(1.5, 2),
  dodecahedron: () => new THREE.DodecahedronGeometry(1.35, 1),
  tetrahedron: () => new THREE.TetrahedronGeometry(1.7, 1),
  sunCoin: () =>
    makeReliefGeometry(
      makePolarShape(
        (angle) => 1 + 0.17 * Math.pow(0.5 + 0.5 * Math.cos(angle * 12), 1.5),
      ),
      { depth: 0.62, waves: 12, waveDepth: 0.018 },
    ),
  lotusCoin: () =>
    makeReliefGeometry(
      makePolarShape((angle) => 0.88 + 0.3 * Math.pow(Math.sin(angle * 4), 2)),
      { depth: 0.64, waves: 8, waveDepth: 0.014 },
    ),
  arrowTarget: () => makeArrowTarget(),
  dollarCoin: () => makeDollarCoin(),
};

async function createGeometry(
  spec: HalftoneGeometrySpec,
  file: File | undefined,
) {
  if (spec.kind === 'imported') {
    if (!file || !spec.loader) {
      throw new Error(`No file is available for ${spec.label}.`);
    }

    return loadImportedGeometry(
      spec.loader as HalftoneModelLoader,
      file,
      spec.label,
    );
  }

  const factory = BUILTIN_GEOMETRIES[spec.key];

  if (!factory) {
    throw new Error(`Unsupported geometry: ${spec.key}.`);
  }

  return factory();
}

export function createFallbackGeometry() {
  return BUILTIN_GEOMETRIES.torusKnot();
}

export async function getGeometryForSpec(
  spec: HalftoneGeometrySpec,
  file: File | undefined,
  cache: Map<string, GeometryCacheEntry>,
) {
  const cached = cache.get(spec.key);

  if (cached) {
    return cached instanceof Promise ? cached : Promise.resolve(cached);
  }

  const created = createGeometry(spec, file);

  if (created instanceof Promise) {
    const pending = created
      .then((geometry) => {
        cache.set(spec.key, geometry);
        return geometry;
      })
      .catch((error) => {
        cache.delete(spec.key);
        throw error;
      });

    cache.set(spec.key, pending);

    return pending;
  }

  cache.set(spec.key, created);

  return Promise.resolve(created);
}

export function disposeGeometryCache(cache: Map<string, GeometryCacheEntry>) {
  for (const value of cache.values()) {
    if (!(value instanceof Promise)) {
      value.dispose();
    }
  }

  cache.clear();
}

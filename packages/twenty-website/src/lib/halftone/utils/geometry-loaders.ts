import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACO_DECODER_PATH } from '@/lib/visual-runtime/utils/draco-decoder-path';

export type HalftoneModelLoader = 'fbx' | 'glb';

export type ImportedGeometryNormalizationOptions = {
  postRotateZ?: number;
  scaleTarget?: number;
  useLegacyNormalization?: boolean;
};

const LEGACY_IMPORTED_GEOMETRY_SCALE_TARGET = 2.75;

const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';

export function mergeGeometries(geometries: THREE.BufferGeometry[]) {
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

function normalizeImportedGeometry(
  geometry: THREE.BufferGeometry,
  options: ImportedGeometryNormalizationOptions = {},
) {
  const {
    postRotateZ = 0,
    scaleTarget,
    useLegacyNormalization = false,
  } = options;

  geometry.computeBoundingBox();

  let boundingBox = geometry.boundingBox;
  let center = new THREE.Vector3();
  let size = new THREE.Vector3();

  boundingBox?.getCenter(center);
  boundingBox?.getSize(size);
  geometry.translate(-center.x, -center.y, -center.z);

  if (!useLegacyNormalization) {
    const dimensions = [size.x, size.y, size.z];
    const thinnestAxis = dimensions.indexOf(Math.min(...dimensions));

    if (thinnestAxis === 0) {
      geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
    } else if (thinnestAxis === 1) {
      geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    }
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const radius = geometry.boundingSphere?.radius || 1;
  const scale = useLegacyNormalization
    ? (scaleTarget ?? LEGACY_IMPORTED_GEOMETRY_SCALE_TARGET) /
      Math.max(size.x, size.y, size.z, 0.001)
    : (scaleTarget ?? 1.6) / radius;
  geometry.scale(scale, scale, scale);

  geometry.computeBoundingBox();
  boundingBox = geometry.boundingBox;
  center = new THREE.Vector3();
  boundingBox?.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  if (postRotateZ !== 0) {
    geometry.rotateZ(postRotateZ);
  }

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

function extractMergedGeometry(
  root: THREE.Object3D,
  emptyMessage: string,
  geometryOptions?: ImportedGeometryNormalizationOptions,
) {
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

  return normalizeImportedGeometry(
    mergeGeometries(geometries),
    geometryOptions,
  );
}

function parseFbxGeometry(
  buffer: ArrayBuffer,
  resourcePath: string,
  label: string,
  geometryOptions?: ImportedGeometryNormalizationOptions,
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
      geometryOptions,
    );
  } finally {
    console.warn = originalWarn;
  }
}

function parseGlbGeometry(
  buffer: ArrayBuffer,
  resourcePath: string,
  label: string,
  geometryOptions?: ImportedGeometryNormalizationOptions,
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
              geometryOptions,
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

export async function loadImportedGeometry(
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
  geometryOptions?: ImportedGeometryNormalizationOptions,
) {
  const cacheKey = getImportedGeometryCacheKey({
    geometryOptions,
    loader,
    modelUrl,
  });
  const cachedGeometry = importedGeometryCache.get(cacheKey);

  if (cachedGeometry) {
    return (await cachedGeometry).clone();
  }

  const geometryPromise = (async () => {
    const response = await fetch(modelUrl);

    if (!response.ok) {
      throw new Error(`Unable to load ${label} from ${modelUrl}.`);
    }

    const buffer = await response.arrayBuffer();

    if (loader === 'fbx') {
      return parseFbxGeometry(buffer, '', label, geometryOptions);
    }

    return parseGlbGeometry(buffer, '', label, geometryOptions);
  })();
  importedGeometryCache.set(cacheKey, geometryPromise);

  try {
    const geometry = await geometryPromise;

    importedGeometryCache.set(cacheKey, geometry);

    return geometry.clone();
  } catch (error) {
    importedGeometryCache.delete(cacheKey);
    throw error;
  }
}

type GeometryUrlCacheEntry =
  | THREE.BufferGeometry
  | Promise<THREE.BufferGeometry>;

const importedGeometryCache = new Map<string, GeometryUrlCacheEntry>();

function getImportedGeometryCacheKey({
  geometryOptions,
  loader,
  modelUrl,
}: {
  geometryOptions?: ImportedGeometryNormalizationOptions;
  loader: HalftoneModelLoader;
  modelUrl: string;
}) {
  return JSON.stringify({
    geometryOptions: geometryOptions ?? null,
    loader,
    modelUrl,
  });
}

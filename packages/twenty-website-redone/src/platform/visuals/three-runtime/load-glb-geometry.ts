import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { createBoundedFailureCache } from '../engine/bounded-failure-cache';

export type LoadGlbGeometryOptions = {
  // Geometry is recentered and scaled so this value is its bounding-sphere
  // radius target — model scale becomes a config knob, not asset trivia.
  scaleTarget?: number;
};

const DEFAULT_SCALE_TARGET = 1.6;
const FAILURE_CACHE_SIZE = 32;

// The halftone material never samples model textures; routing image URLs
// to a 1x1 transparent PNG keeps GLB loads from fetching dead weight.
const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';

const geometryCache = new Map<string, Promise<THREE.BufferGeometry>>();
const failureCache = createBoundedFailureCache(FAILURE_CACHE_SIZE);

function mergeGeometries(
  geometries: THREE.BufferGeometry[],
): THREE.BufferGeometry {
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

function normalizeGeometry(
  geometry: THREE.BufferGeometry,
  scaleTarget: number,
): THREE.BufferGeometry {
  geometry.computeBoundingBox();

  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  geometry.boundingBox?.getCenter(center);
  geometry.boundingBox?.getSize(size);
  geometry.translate(-center.x, -center.y, -center.z);

  // Flat models author best facing the camera: rotate the thinnest axis
  // toward the viewer (ported behavior the model poses depend on).
  const dimensions = [size.x, size.y, size.z];
  const thinnestAxis = dimensions.indexOf(Math.min(...dimensions));
  if (thinnestAxis === 0) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
  } else if (thinnestAxis === 1) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  }

  geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere?.radius || 1;
  const scale = scaleTarget / radius;
  geometry.scale(scale, scale, scale);

  geometry.computeBoundingBox();
  const recenter = new THREE.Vector3();
  geometry.boundingBox?.getCenter(recenter);
  geometry.translate(-recenter.x, -recenter.y, -recenter.z);

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

// Loads a (non-Draco) GLB, merges its meshes in world space, recenters and
// scales. Cached per url+target; failures are remembered so a broken asset
// doesn't refetch every mount.
export function loadGlbGeometry(
  url: string,
  { scaleTarget = DEFAULT_SCALE_TARGET }: LoadGlbGeometryOptions = {},
): Promise<THREE.BufferGeometry> {
  const cacheKey = `${url}#${scaleTarget}`;

  if (failureCache.has(cacheKey)) {
    return Promise.reject(new Error(`GLB previously failed: ${url}`));
  }

  const cached = geometryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((assetUrl) =>
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(assetUrl)
      ? EMPTY_TEXTURE_DATA_URL
      : assetUrl,
  );

  const promise = new GLTFLoader(loadingManager)
    .loadAsync(url)
    .then((gltf) => {
      gltf.scene.updateMatrixWorld(true);

      const geometries: THREE.BufferGeometry[] = [];
      gltf.scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh) || !object.geometry) {
          return;
        }
        const geometry = (object.geometry as THREE.BufferGeometry).clone();
        if (!geometry.attributes.normal) {
          geometry.computeVertexNormals();
        }
        geometry.applyMatrix4(object.matrixWorld);
        geometries.push(geometry);
      });

      if (geometries.length === 0) {
        throw new Error(`GLB contains no mesh geometry: ${url}`);
      }

      return normalizeGeometry(mergeGeometries(geometries), scaleTarget);
    })
    .catch((error: unknown) => {
      geometryCache.delete(cacheKey);
      failureCache.add(cacheKey);
      throw error;
    });

  geometryCache.set(cacheKey, promise);
  return promise;
}

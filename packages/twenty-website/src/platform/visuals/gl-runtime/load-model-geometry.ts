import { MeshoptDecoder } from 'meshoptimizer/decoder';

import { createBoundedFailureCache } from '../engine/bounded-failure-cache';

export type ModelGeometryData = {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  // The band composite scales dash density by the mesh's projected area, so
  // it needs the local bounds the old loader read off BufferGeometry.
  bounds: { min: number[]; max: number[] };
};

export type LoadModelGeometryOptions = {
  // Geometry is recentered and scaled so this value is its bounding-sphere
  // radius target — model scale becomes a config knob, not asset trivia.
  scaleTarget?: number;
  // The studio-era normalization some authored models were posed against:
  // scale by max dimension (target 2.75) and skip the thinnest-axis
  // rotation.
  legacyNormalization?: boolean;
  postRotateZ?: number;
};

const DEFAULT_SCALE_TARGET = 1.6;
const LEGACY_SCALE_TARGET = 2.75;
const FAILURE_CACHE_SIZE = 32;
const GEOMETRY_MAGIC = 0x4547_5754; // 'TWGE' little-endian
const GEOMETRY_VERSION = 4;

const geometryCache = new Map<string, Promise<ModelGeometryData>>();
const failureCache = createBoundedFailureCache(FAILURE_CACHE_SIZE);

function decodeGeometryFile(buffer: ArrayBuffer) {
  const header = new DataView(buffer);
  if (header.getUint32(0, true) !== GEOMETRY_MAGIC) {
    throw new Error('Not a .geo buffer');
  }
  const version = header.getUint32(4, true);
  if (version !== GEOMETRY_VERSION) {
    throw new Error(`Unsupported .geo version ${version}`);
  }

  const vertexCount = header.getUint32(8, true);
  const indexCount = header.getUint32(12, true);
  const positionByteLength = header.getUint32(16, true);
  const indexByteLength = header.getUint32(20, true);

  const positionsStart = 24;
  const indicesStart = positionsStart + positionByteLength;

  // No filter: positions are stored as raw float32 through the vertex codec,
  // because normals are derived from them and any quantization shows up as
  // halftone noise. See build-model-geometry.mjs.
  const positions = new Float32Array(vertexCount * 3);
  MeshoptDecoder.decodeVertexBuffer(
    new Uint8Array(positions.buffer),
    vertexCount,
    12,
    new Uint8Array(buffer, positionsStart, positionByteLength),
  );

  const indices = new Uint32Array(indexCount);
  MeshoptDecoder.decodeIndexBuffer(
    new Uint8Array(indices.buffer),
    indexCount,
    4,
    new Uint8Array(buffer, indicesStart, indexByteLength),
  );

  return { positions, indices };
}

function computeVertexNormals(positions: Float32Array, indices: Uint32Array) {
  const normals = new Float32Array(positions.length);

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3;
    const b = indices[i + 1] * 3;
    const c = indices[i + 2] * 3;

    const abx = positions[b] - positions[a];
    const aby = positions[b + 1] - positions[a + 1];
    const abz = positions[b + 2] - positions[a + 2];
    const acx = positions[c] - positions[a];
    const acy = positions[c + 1] - positions[a + 1];
    const acz = positions[c + 2] - positions[a + 2];

    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;

    normals[a] += nx;
    normals[a + 1] += ny;
    normals[a + 2] += nz;
    normals[b] += nx;
    normals[b + 1] += ny;
    normals[b + 2] += nz;
    normals[c] += nx;
    normals[c + 1] += ny;
    normals[c + 2] += nz;
  }

  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    normals[i] /= length;
    normals[i + 1] /= length;
    normals[i + 2] /= length;
  }

  return normals;
}

function getBounds(positions: Float32Array) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < positions.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = positions[i + axis];
      if (value < min[axis]) {
        min[axis] = value;
      }
      if (value > max[axis]) {
        max[axis] = value;
      }
    }
  }

  return {
    min,
    max,
    center: [
      (min[0] + max[0]) / 2,
      (min[1] + max[1]) / 2,
      (min[2] + max[2]) / 2,
    ],
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
  };
}

function translate(positions: Float32Array, offset: number[]) {
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] -= offset[0];
    positions[i + 1] -= offset[1];
    positions[i + 2] -= offset[2];
  }
}

function rotateAboutY(positions: Float32Array, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    positions[i] = x * cos + z * sin;
    positions[i + 2] = -x * sin + z * cos;
  }
}

function rotateAboutX(positions: Float32Array, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let i = 0; i < positions.length; i += 3) {
    const y = positions[i + 1];
    const z = positions[i + 2];
    positions[i + 1] = y * cos - z * sin;
    positions[i + 2] = y * sin + z * cos;
  }
}

function rotateAboutZ(positions: Float32Array, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    positions[i] = x * cos - y * sin;
    positions[i + 1] = x * sin + y * cos;
  }
}

function getBoundingSphereRadius(positions: Float32Array) {
  let radiusSquared = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const distanceSquared =
      positions[i] * positions[i] +
      positions[i + 1] * positions[i + 1] +
      positions[i + 2] * positions[i + 2];
    if (distanceSquared > radiusSquared) {
      radiusSquared = distanceSquared;
    }
  }
  return Math.sqrt(radiusSquared);
}

function normalizeGeometry(
  positions: Float32Array,
  indices: Uint32Array,
  {
    scaleTarget,
    legacyNormalization = false,
    postRotateZ = 0,
  }: LoadModelGeometryOptions,
): ModelGeometryData {
  const bounds = getBounds(positions);
  translate(positions, bounds.center);

  if (!legacyNormalization) {
    // Flat models author best facing the camera: rotate the thinnest axis
    // toward the viewer (ported behavior the model poses depend on).
    const thinnestAxis = bounds.size.indexOf(Math.min(...bounds.size));
    if (thinnestAxis === 0) {
      rotateAboutY(positions, Math.PI / 2);
    } else if (thinnestAxis === 1) {
      rotateAboutX(positions, Math.PI / 2);
    }
  }

  const radius = getBoundingSphereRadius(positions) || 1;
  const scale = legacyNormalization
    ? (scaleTarget ?? LEGACY_SCALE_TARGET) /
      Math.max(bounds.size[0], bounds.size[1], bounds.size[2], 0.001)
    : (scaleTarget ?? DEFAULT_SCALE_TARGET) / radius;

  for (let i = 0; i < positions.length; i += 1) {
    positions[i] *= scale;
  }

  translate(positions, getBounds(positions).center);

  if (postRotateZ !== 0) {
    rotateAboutZ(positions, postRotateZ);
  }

  const finalBounds = getBounds(positions);

  return {
    positions,
    indices,
    normals: computeVertexNormals(positions, indices),
    bounds: { min: finalBounds.min, max: finalBounds.max },
  };
}

// Loads a build-time .geo buffer, then recenters and scales it. Cached per
// url+target; failures are remembered so a broken asset doesn't refetch every
// mount. The result is context-free typed arrays, so several sessions can
// share one decode and build their own ogl Geometry from it.
export function loadModelGeometry(
  url: string,
  options: LoadModelGeometryOptions = {},
): Promise<ModelGeometryData> {
  const cacheKey = `${url}#${JSON.stringify(options)}`;

  if (failureCache.has(cacheKey)) {
    return Promise.reject(new Error(`Geometry previously failed: ${url}`));
  }

  const cached = geometryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Geometry request failed: ${url} (${response.status})`);
      }
      // .geo ships gzipped in-file: Cloudflare will not compress
      // application/octet-stream, so the CDN is taken out of the equation and
      // the browser's own inflate does the work.
      if (response.body === null) {
        return response.arrayBuffer();
      }
      return new Response(
        response.body.pipeThrough(new DecompressionStream('gzip')),
      ).arrayBuffer();
    })
    .then(async (buffer) => {
      await MeshoptDecoder.ready;
      const { positions, indices } = decodeGeometryFile(buffer);
      if (positions.length === 0) {
        throw new Error(`Geometry contains no vertices: ${url}`);
      }
      return normalizeGeometry(positions, indices, options);
    })
    .catch((error: unknown) => {
      geometryCache.delete(cacheKey);
      failureCache.add(cacheKey);
      throw error;
    });

  geometryCache.set(cacheKey, promise);
  return promise;
}

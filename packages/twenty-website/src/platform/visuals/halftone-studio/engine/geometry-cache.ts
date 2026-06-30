import type * as THREE from 'three';

import { BUILTIN_GEOMETRIES } from './geometry-builtins';
import { HALFTONE_GEOMETRY_LOADERS } from './geometry-loaders';
import { type HalftoneGeometrySpec } from './studio-settings-types';

export type GeometryCacheEntry =
  | THREE.BufferGeometry
  | Promise<THREE.BufferGeometry>;

async function createGeometry(
  spec: HalftoneGeometrySpec,
  file: File | undefined,
) {
  if (spec.kind === 'imported') {
    if (!file || !spec.loader) {
      throw new Error(`No file is available for ${spec.label}.`);
    }

    return HALFTONE_GEOMETRY_LOADERS.loadFromFile(
      spec.loader,
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

function createFallbackGeometry() {
  return BUILTIN_GEOMETRIES.torusKnot();
}

async function getGeometryForSpec(
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

function disposeGeometryCache(cache: Map<string, GeometryCacheEntry>) {
  for (const value of cache.values()) {
    if (!(value instanceof Promise)) {
      value.dispose();
    }
  }

  cache.clear();
}

export const HALFTONE_GEOMETRY_CACHE = {
  createFallback: createFallbackGeometry,
  getForSpec: getGeometryForSpec,
  dispose: disposeGeometryCache,
};

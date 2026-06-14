import type * as THREE from 'three';
import {
  loadImportedGeometry,
  type HalftoneModelLoader,
} from './geometry-loaders';
import { BUILTIN_GEOMETRIES } from './geometry-builtins';

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

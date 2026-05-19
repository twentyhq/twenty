import type * as THREE from 'three';

import { useAsyncResource } from './use-async-resource';

const DISPOSE_GEOMETRY = (geometry: THREE.BufferGeometry) => geometry.dispose();

export function useAsyncGeometry(
  loader: (() => Promise<THREE.BufferGeometry>) | null,
  deps: readonly unknown[],
) {
  return useAsyncResource(loader, deps, { dispose: DISPOSE_GEOMETRY });
}

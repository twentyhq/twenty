import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

// flatFieldMetadataMapsOrm is a projection of flatFieldMetadataMaps, so it has
// to be recomputed whenever the field metadata maps are.
export const withDerivedFieldMetadataMaps = (
  keys: (keyof WorkspaceCacheDataMap)[],
): (keyof WorkspaceCacheDataMap)[] =>
  keys.includes('flatFieldMetadataMaps')
    ? [...keys, 'flatFieldMetadataMapsOrm']
    : keys;

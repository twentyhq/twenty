import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

// Record-native, partial companion operations a handler emits. Each bucket is keyed by
// universalIdentifier so the engine merges/deduplicates against the matrix in O(1),
// matching the shape it consumes (AllFlatEntityOperationRecordByMetadataName).
export type MetadataSideEffectOperationsByMetadataName = {
  [P in AllMetadataName]?: {
    flatEntityToCreate?: Record<
      string,
      MetadataUniversalFlatEntity<P> & { id?: string }
    >;
    flatEntityToUpdate?: Record<string, MetadataUniversalFlatEntity<P>>;
    flatEntityToDelete?: Record<string, MetadataUniversalFlatEntity<P>>;
  };
};

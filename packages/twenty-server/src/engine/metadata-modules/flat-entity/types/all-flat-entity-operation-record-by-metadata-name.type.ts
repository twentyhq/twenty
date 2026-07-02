import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

// Canonical operation matrix keyed by universalIdentifier. This is the record-native
// counterpart of AllFlatEntityOperationByMetadataName (array buckets): the side-effect
// engine and the manifest sync operate on this form directly, so parent resolution and
// deduplication are O(1) lookups instead of array scans. Array-based API callers are
// transpiled into this shape at the validate-build-and-run boundary until every caller
// produces records natively.
export type FlatEntityOperationRecord<T extends AllMetadataName> = {
  flatEntityToCreate: Record<string, MetadataUniversalFlatEntity<T> & { id?: string }>;
  flatEntityToUpdate: Record<string, MetadataUniversalFlatEntity<T>>;
  flatEntityToDelete: Record<string, MetadataUniversalFlatEntity<T>>;
};

export type AllFlatEntityOperationRecordByMetadataName = {
  [P in AllMetadataName]?: FlatEntityOperationRecord<P>;
};

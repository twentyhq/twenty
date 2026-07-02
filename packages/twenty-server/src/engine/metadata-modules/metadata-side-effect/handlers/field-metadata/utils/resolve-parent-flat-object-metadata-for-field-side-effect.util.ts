import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const resolveParentFlatObjectMetadataForFieldSideEffect = ({
  objectMetadataUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps,
}: {
  objectMetadataUniversalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<'fieldMetadata'>;
}): UniversalFlatObjectMetadata | undefined => {
  // Resolve optimistically: an object created OR updated in the same batch is the
  // caller's current intent and must win over the stale workspace-cache version.
  // Otherwise a field flipped to `isUnique` while its object is renamed in the
  // same batch would build the backing index from the pre-rename object, yielding
  // the wrong table name and therefore the wrong deterministic identifier. Both
  // in-batch buckets are resolved in O(1) via the per-operation record.
  const pendingFlatObjectMetadata =
    allFlatEntityOperationRecordByMetadataName.objectMetadata
      ?.flatEntityToUpdate[objectMetadataUniversalIdentifier] ??
    allFlatEntityOperationRecordByMetadataName.objectMetadata
      ?.flatEntityToCreate[objectMetadataUniversalIdentifier];

  if (isDefined(pendingFlatObjectMetadata)) {
    return pendingFlatObjectMetadata;
  }

  return relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
    objectMetadataUniversalIdentifier
  ];
};

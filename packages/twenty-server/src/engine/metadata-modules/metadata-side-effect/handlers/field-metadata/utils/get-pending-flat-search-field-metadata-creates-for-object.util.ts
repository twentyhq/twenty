import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

// Side-effect handlers all read the same pre-batch maps, so rows created by
// sibling side effects in the current batch are only visible through the
// accumulated operation record. Needed to append at a distinct position and
// to avoid double-creating a row another handler already provisioned.
export const getPendingFlatSearchFieldMetadataCreatesForObject = ({
  objectMetadataUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
}: {
  objectMetadataUniversalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
}): MetadataUniversalFlatEntity<'searchFieldMetadata'>[] =>
  Object.values(
    allFlatEntityOperationRecordByMetadataName.searchFieldMetadata
      ?.flatEntityToCreate ?? {},
  )
    .filter(isDefined)
    .filter(
      (pendingFlatSearchFieldMetadata) =>
        pendingFlatSearchFieldMetadata.objectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier,
    );

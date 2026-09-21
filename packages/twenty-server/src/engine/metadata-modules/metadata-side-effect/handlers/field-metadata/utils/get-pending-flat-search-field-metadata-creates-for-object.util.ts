import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

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

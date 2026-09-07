import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const findFlatObjectMetadataAfterOperations = ({
  objectMetadataUniversalIdentifier,
  flatObjectMetadataMaps,
  allFlatEntityOperationRecordByMetadataName,
}: {
  objectMetadataUniversalIdentifier: string;
  flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
  allFlatEntityOperationRecordByMetadataName: Partial<AllFlatEntityOperationRecordByMetadataName>;
}): UniversalFlatObjectMetadata | FlatObjectMetadata | undefined => {
  const objectMetadataOperations =
    allFlatEntityOperationRecordByMetadataName.objectMetadata;

  if (
    isDefined(
      objectMetadataOperations?.flatEntityToDelete?.[
        objectMetadataUniversalIdentifier
      ],
    )
  ) {
    return undefined;
  }

  return (
    objectMetadataOperations?.flatEntityToUpdate?.[
      objectMetadataUniversalIdentifier
    ] ??
    flatObjectMetadataMaps.byUniversalIdentifier[
      objectMetadataUniversalIdentifier
    ]
  );
};

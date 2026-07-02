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

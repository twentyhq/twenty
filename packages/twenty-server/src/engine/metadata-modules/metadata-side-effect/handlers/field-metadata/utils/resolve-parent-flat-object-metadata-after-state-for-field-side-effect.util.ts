import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const resolveParentFlatObjectMetadataAfterStateForFieldSideEffect = ({
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

  return (
    pendingFlatObjectMetadata ??
    relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      objectMetadataUniversalIdentifier
    ]
  );
};

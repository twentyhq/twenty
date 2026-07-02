import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type AllFlatEntityOperationIndexByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/all-flat-entity-operation-index-by-metadata-name.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const resolveParentFlatObjectMetadataForFieldSideEffect = ({
  objectMetadataUniversalIdentifier,
  allFlatEntityOperationIndexByMetadataName,
  relatedFlatEntityMaps,
}: {
  objectMetadataUniversalIdentifier: string;
  allFlatEntityOperationIndexByMetadataName: AllFlatEntityOperationIndexByMetadataName;
  relatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<'fieldMetadata'>;
}): UniversalFlatObjectMetadata | undefined => {
  const pendingFlatObjectMetadata =
    allFlatEntityOperationIndexByMetadataName.objectMetadata?.flatEntityToUpdate.get(
      objectMetadataUniversalIdentifier,
    ) ??
    allFlatEntityOperationIndexByMetadataName.objectMetadata?.flatEntityToCreate.get(
      objectMetadataUniversalIdentifier,
    );

  if (isDefined(pendingFlatObjectMetadata)) {
    return pendingFlatObjectMetadata;
  }

  return relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
    objectMetadataUniversalIdentifier
  ];
};

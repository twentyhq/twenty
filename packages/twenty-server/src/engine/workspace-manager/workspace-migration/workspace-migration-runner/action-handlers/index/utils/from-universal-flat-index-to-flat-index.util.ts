import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export const fromUniversalFlatIndexToFlatIndex = ({
  universalFlatIndexMetadata,
  indexMetadataId,
  allFlatEntityMaps,
  workspaceId,
  applicationId,
}: {
  universalFlatIndexMetadata: UniversalFlatIndexMetadata;
  indexMetadataId: string;
  allFlatEntityMaps: AllFlatEntityMaps;
  workspaceId: string;
  applicationId: string;
}): FlatIndexMetadata => {
  const objectMetadata = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: allFlatEntityMaps.flatObjectMetadataMaps,
    universalIdentifier:
      universalFlatIndexMetadata.objectMetadataUniversalIdentifier,
  });

  if (!isDefined(objectMetadata)) {
    throw new FlatEntityMapsException(
      `Could not resolve objectMetadataUniversalIdentifier to objectMetadataId: no objectMetadata found for universal identifier ${universalFlatIndexMetadata.objectMetadataUniversalIdentifier}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const now = new Date().toISOString();

  const flatIndexFieldMetadatas =
    universalFlatIndexMetadata.universalFlatIndexFieldMetadatas.map(
      (universalFlatIndexFieldMetadata) => {
        const fieldMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: allFlatEntityMaps.flatFieldMetadataMaps,
          universalIdentifier:
            universalFlatIndexFieldMetadata.fieldMetadataUniversalIdentifier,
        });

        if (!isDefined(fieldMetadata)) {
          throw new FlatEntityMapsException(
            `Could not resolve fieldMetadataUniversalIdentifier to fieldMetadataId: no fieldMetadata found for universal identifier ${universalFlatIndexFieldMetadata.fieldMetadataUniversalIdentifier}`,
            FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        return {
          id: v4(),
          indexMetadataId,
          fieldMetadataId: fieldMetadata.id,
          order: universalFlatIndexFieldMetadata.order,
          createdAt: now,
          updatedAt: now,
        };
      },
    );

  return {
    id: indexMetadataId,
    universalFlatIndexFieldMetadatas:
      universalFlatIndexMetadata.universalFlatIndexFieldMetadatas,
    universalIdentifier: universalFlatIndexMetadata.universalIdentifier,
    applicationId,
    applicationUniversalIdentifier:
      universalFlatIndexMetadata.applicationUniversalIdentifier,
    workspaceId,
    objectMetadataId: objectMetadata.id,
    objectMetadataUniversalIdentifier:
      universalFlatIndexMetadata.objectMetadataUniversalIdentifier,
    name: universalFlatIndexMetadata.name,
    isCustom: universalFlatIndexMetadata.isCustom,
    isUnique: universalFlatIndexMetadata.isUnique,
    indexWhereClause: universalFlatIndexMetadata.indexWhereClause,
    indexType: universalFlatIndexMetadata.indexType,
    createdAt: universalFlatIndexMetadata.createdAt,
    updatedAt: universalFlatIndexMetadata.updatedAt,
    flatIndexFieldMetadatas,
  };
};

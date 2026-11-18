import {
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScope,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

export const fromUniversalRelationScopeToViewFieldRelationScope = ({
  universalRelationScope,
  flatFieldMetadataMaps,
}: {
  universalRelationScope: UniversalViewFieldRelationScope;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): ViewFieldRelationScope => {
  const toFieldMetadataIdOrThrow = (
    fieldMetadataUniversalIdentifier: string | null,
  ): string => {
    const flatFieldMetadata = isDefined(fieldMetadataUniversalIdentifier)
      ? findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: fieldMetadataUniversalIdentifier,
        })
      : undefined;

    if (!isDefined(flatFieldMetadata)) {
      throw new FlatEntityMapsException(
        `Field metadata not found for relation scope universal identifier: ${fieldMetadataUniversalIdentifier}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    return flatFieldMetadata.id;
  };

  return {
    ...universalRelationScope,
    filters: universalRelationScope.filters.map(
      ({
        fieldMetadataUniversalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier,
        ...filter
      }) => ({
        ...filter,
        fieldMetadataId: toFieldMetadataIdOrThrow(
          fieldMetadataUniversalIdentifier,
        ),
        ...(relationTargetFieldMetadataUniversalIdentifier !== undefined
          ? {
              relationTargetFieldMetadataId: toFieldMetadataIdOrThrow(
                relationTargetFieldMetadataUniversalIdentifier,
              ),
            }
          : {}),
      }),
    ),
    sorts: universalRelationScope.sorts.map(
      ({
        fieldMetadataUniversalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier,
        ...sort
      }) => ({
        ...sort,
        fieldMetadataId: toFieldMetadataIdOrThrow(
          fieldMetadataUniversalIdentifier,
        ),
        ...(relationTargetFieldMetadataUniversalIdentifier !== undefined
          ? {
              relationTargetFieldMetadataId: toFieldMetadataIdOrThrow(
                relationTargetFieldMetadataUniversalIdentifier,
              ),
            }
          : {}),
      }),
    ),
  };
};

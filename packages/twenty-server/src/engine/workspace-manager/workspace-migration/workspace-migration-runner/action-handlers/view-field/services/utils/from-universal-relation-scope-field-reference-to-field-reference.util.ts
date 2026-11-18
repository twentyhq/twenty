import {
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScopeFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

type UniversalRelationScopeFieldReference = Pick<
  UniversalViewFieldRelationScope['filters'][number],
  | 'fieldMetadataUniversalIdentifier'
  | 'relationTargetFieldMetadataUniversalIdentifier'
>;

type RelationScopeFieldReference = Pick<
  ViewFieldRelationScopeFilter,
  'fieldMetadataId' | 'relationTargetFieldMetadataId'
>;

const toFieldMetadataIdOrThrow = ({
  fieldMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  fieldMetadataUniversalIdentifier: string | null;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): string => {
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

export const fromUniversalRelationScopeFieldReferenceToFieldReference = ({
  universalFieldReference: {
    fieldMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
  },
  flatFieldMetadataMaps,
}: {
  universalFieldReference: UniversalRelationScopeFieldReference;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): RelationScopeFieldReference => ({
  fieldMetadataId: toFieldMetadataIdOrThrow({
    fieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  }),
  ...(isDefined(relationTargetFieldMetadataUniversalIdentifier)
    ? {
        relationTargetFieldMetadataId: toFieldMetadataIdOrThrow({
          fieldMetadataUniversalIdentifier:
            relationTargetFieldMetadataUniversalIdentifier,
          flatFieldMetadataMaps,
        }),
      }
    : {}),
});

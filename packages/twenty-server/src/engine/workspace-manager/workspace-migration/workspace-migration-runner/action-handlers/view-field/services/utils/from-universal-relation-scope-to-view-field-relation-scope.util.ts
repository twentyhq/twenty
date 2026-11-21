import {
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScope,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';

type UniversalRelationScopeFieldReference = Pick<
  UniversalViewFieldRelationScope['filters'][number],
  | 'fieldMetadataUniversalIdentifier'
  | 'relationTargetFieldMetadataUniversalIdentifier'
>;

const toFieldMetadataIdOrThrow = ({
  universalIdentifier,
  flatFieldMetadataMaps,
}: {
  universalIdentifier: string | null;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): string =>
  findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    // An unresolved (null) reference never matches, so it throws like a missing one
    universalIdentifier: universalIdentifier ?? '',
  }).id;

const toFieldReference = <
  TUniversalFieldReference extends UniversalRelationScopeFieldReference,
>({
  universalFieldReference: {
    fieldMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
    ...fieldReference
  },
  flatFieldMetadataMaps,
}: {
  universalFieldReference: TUniversalFieldReference;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}) => ({
  ...fieldReference,
  fieldMetadataId: toFieldMetadataIdOrThrow({
    universalIdentifier: fieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  }),
  ...(isDefined(relationTargetFieldMetadataUniversalIdentifier)
    ? {
        relationTargetFieldMetadataId: toFieldMetadataIdOrThrow({
          universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
          flatFieldMetadataMaps,
        }),
      }
    : {}),
});

export const fromUniversalRelationScopeToViewFieldRelationScope = ({
  universalRelationScope,
  flatFieldMetadataMaps,
}: {
  universalRelationScope: UniversalViewFieldRelationScope;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): ViewFieldRelationScope => ({
  ...universalRelationScope,
  filters: universalRelationScope.filters.map((filter) =>
    toFieldReference({
      universalFieldReference: filter,
      flatFieldMetadataMaps,
    }),
  ),
  sorts: universalRelationScope.sorts.map((sort) =>
    toFieldReference({ universalFieldReference: sort, flatFieldMetadataMaps }),
  ),
});

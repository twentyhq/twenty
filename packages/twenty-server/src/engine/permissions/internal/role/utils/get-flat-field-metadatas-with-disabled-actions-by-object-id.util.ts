import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

// Field metadata maps are immutable per cache version, so the grouping is built once per version
const fieldsWithDisabledActionsByObjectIdCache = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  Map<string, OrmFlatFieldMetadata[]>
>();

// A disabled read also hides the inverse relation field; updates stay on the side that holds the join column
const getInverseRelationFlatFieldMetadatas = (
  flatFieldMetadata: OrmFlatFieldMetadata,
): OrmFlatFieldMetadata[] => {
  if (
    !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
    !isDefined(flatFieldMetadata.relationTargetFieldMetadataId) ||
    !isDefined(flatFieldMetadata.relationTargetObjectMetadataId) ||
    !flatFieldMetadata.disabledFieldPermissionActions?.includes(
      'canReadFieldValue',
    )
  ) {
    return [];
  }

  return [
    {
      ...flatFieldMetadata,
      id: flatFieldMetadata.relationTargetFieldMetadataId,
      objectMetadataId: flatFieldMetadata.relationTargetObjectMetadataId,
      disabledFieldPermissionActions: ['canReadFieldValue'],
    },
  ];
};

export const getFlatFieldMetadatasWithDisabledActionsByObjectId = (
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
): Map<string, OrmFlatFieldMetadata[]> => {
  const cached = fieldsWithDisabledActionsByObjectIdCache.get(
    flatFieldMetadataMaps,
  );

  if (isDefined(cached)) {
    return cached;
  }

  const fieldsByObjectId = new Map<string, OrmFlatFieldMetadata[]>();

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(flatFieldMetadata) ||
      !isNonEmptyArray(flatFieldMetadata.disabledFieldPermissionActions)
    ) {
      continue;
    }

    for (const restrictedFlatFieldMetadata of [
      flatFieldMetadata,
      ...getInverseRelationFlatFieldMetadatas(flatFieldMetadata),
    ]) {
      fieldsByObjectId.set(restrictedFlatFieldMetadata.objectMetadataId, [
        ...(fieldsByObjectId.get(
          restrictedFlatFieldMetadata.objectMetadataId,
        ) ?? []),
        restrictedFlatFieldMetadata,
      ]);
    }
  }

  fieldsWithDisabledActionsByObjectIdCache.set(
    flatFieldMetadataMaps,
    fieldsByObjectId,
  );

  return fieldsByObjectId;
};

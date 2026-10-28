import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

// Field metadata maps are immutable per cache version, so the grouping is built once per version
const fieldsWithDisabledActionsByObjectIdCache = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  Map<string, OrmFlatFieldMetadata[]>
>();

// Like saved field permissions, a relation's restriction also applies to its inverse field
const getInverseRelationFlatFieldMetadatas = (
  flatFieldMetadata: OrmFlatFieldMetadata,
): OrmFlatFieldMetadata[] => {
  if (
    flatFieldMetadata.type !== FieldMetadataType.RELATION ||
    !isDefined(flatFieldMetadata.relationTargetFieldMetadataId) ||
    !isDefined(flatFieldMetadata.relationTargetObjectMetadataId)
  ) {
    return [];
  }

  return [
    {
      ...flatFieldMetadata,
      id: flatFieldMetadata.relationTargetFieldMetadataId,
      objectMetadataId: flatFieldMetadata.relationTargetObjectMetadataId,
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

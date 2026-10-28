import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

// Field metadata maps are immutable per cache version, so the grouping is built once per version
const fieldsWithDisabledActionsByObjectIdCache = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  Map<string, OrmFlatFieldMetadata[]>
>();

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

    fieldsByObjectId.set(flatFieldMetadata.objectMetadataId, [
      ...(fieldsByObjectId.get(flatFieldMetadata.objectMetadataId) ?? []),
      flatFieldMetadata,
    ]);
  }

  fieldsWithDisabledActionsByObjectIdCache.set(
    flatFieldMetadataMaps,
    fieldsByObjectId,
  );

  return fieldsByObjectId;
};

import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

type FlatFieldMetadataWithDisabledActions = Pick<
  OrmFlatFieldMetadata,
  'id' | 'name' | 'applicationId' | 'disabledFieldPermissionActions'
>;

const fieldsWithDisabledActionsByObjectIdCache = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  Map<string, FlatFieldMetadataWithDisabledActions[]>
>();

const getMorphTargetIds = ({
  flatFieldMetadata,
  morphTargetIdsByMorphId,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  morphTargetIdsByMorphId: Map<string, string[]>;
}): string[] => {
  if (
    !isMorphRelationHead(flatFieldMetadata) ||
    !isDefined(flatFieldMetadata.morphId)
  ) {
    return [];
  }

  return morphTargetIdsByMorphId.get(flatFieldMetadata.morphId) ?? [];
};

// A morph relation head has no column of its own: its disabled actions apply to every target column
export const getFlatFieldMetadatasWithDisabledActionsByObjectId = (
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
): Map<string, FlatFieldMetadataWithDisabledActions[]> => {
  const cached = fieldsWithDisabledActionsByObjectIdCache.get(
    flatFieldMetadataMaps,
  );

  if (isDefined(cached)) {
    return cached;
  }

  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const morphTargetIdsByMorphId = new Map<string, string[]>();

  for (const flatFieldMetadata of flatFieldMetadatas) {
    if (
      flatFieldMetadata.type !== FieldMetadataType.MORPH_RELATION ||
      !isDefined(flatFieldMetadata.morphId) ||
      isMorphRelationHead(flatFieldMetadata)
    ) {
      continue;
    }

    morphTargetIdsByMorphId.set(flatFieldMetadata.morphId, [
      ...(morphTargetIdsByMorphId.get(flatFieldMetadata.morphId) ?? []),
      flatFieldMetadata.id,
    ]);
  }

  const fieldsByObjectId = new Map<
    string,
    FlatFieldMetadataWithDisabledActions[]
  >();

  for (const flatFieldMetadata of flatFieldMetadatas) {
    if (!isNonEmptyArray(flatFieldMetadata.disabledFieldPermissionActions)) {
      continue;
    }

    const restrictedFieldIds = [
      flatFieldMetadata.id,
      ...getMorphTargetIds({ flatFieldMetadata, morphTargetIdsByMorphId }),
    ];

    fieldsByObjectId.set(flatFieldMetadata.objectMetadataId, [
      ...(fieldsByObjectId.get(flatFieldMetadata.objectMetadataId) ?? []),
      ...restrictedFieldIds.map((id) => ({ ...flatFieldMetadata, id })),
    ]);
  }

  fieldsWithDisabledActionsByObjectIdCache.set(
    flatFieldMetadataMaps,
    fieldsByObjectId,
  );

  return fieldsByObjectId;
};

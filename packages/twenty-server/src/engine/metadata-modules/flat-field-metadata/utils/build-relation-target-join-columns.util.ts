import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { FlatEntityMapsException } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RelationTargetJoinColumn } from 'src/engine/metadata-modules/flat-field-metadata/types/relation-target-join-column.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildRelationTargetJoinColumns = ({
  targetFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  targetFlatFieldMetadata: OrmFlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RelationTargetJoinColumn[] => {
  const { settings, type } = targetFlatFieldMetadata;

  if (
    (type !== FieldMetadataType.RELATION &&
      type !== FieldMetadataType.MORPH_RELATION) ||
    !isFieldMetadataSettingsOfType(settings, type) ||
    settings.relationType !== RelationType.MANY_TO_ONE
  ) {
    return [];
  }

  const containingFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: targetFlatFieldMetadata.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(containingFlatObjectMetadata)) {
    return [];
  }

  let targetFlatFieldMetadatas: OrmFlatFieldMetadata[];

  try {
    targetFlatFieldMetadatas = isFlatFieldMetadataOfType(
      targetFlatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
      ? [
          targetFlatFieldMetadata,
          ...findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
            flatFieldMetadata: targetFlatFieldMetadata,
            flatFieldMetadataMaps,
            flatObjectMetadata: containingFlatObjectMetadata,
          }),
        ]
      : [targetFlatFieldMetadata];
  } catch (error) {
    if (error instanceof FlatEntityMapsException) {
      return [];
    }

    throw error;
  }

  return targetFlatFieldMetadatas
    .map((flatFieldMetadata): RelationTargetJoinColumn | undefined => {
      const targetObjectMetadataId =
        flatFieldMetadata.relationTargetObjectMetadataId;

      if (!isDefined(targetObjectMetadataId)) {
        return undefined;
      }

      const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: targetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      return isDefined(targetFlatObjectMetadata)
        ? {
            joinColumnName:
              getJoinColumnNameForRelationField(flatFieldMetadata),
            targetObjectMetadataId: targetFlatObjectMetadata.id,
            targetObjectNameSingular: targetFlatObjectMetadata.nameSingular,
          }
        : undefined;
    })
    .filter(isDefined);
};

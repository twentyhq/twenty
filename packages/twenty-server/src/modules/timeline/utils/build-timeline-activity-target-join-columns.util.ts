import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { FlatEntityMapsException } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-rule-target-join-column.type';

export const buildTimelineActivityTargetJoinColumns = ({
  targetFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  targetFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TimelineActivityRuleTargetJoinColumn[] => {
  const containingFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: targetFlatFieldMetadata.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(containingFlatObjectMetadata)) {
    return [];
  }

  let targetFlatFieldMetadatas: FlatFieldMetadata[];

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
    .map(
      (flatFieldMetadata): TimelineActivityRuleTargetJoinColumn | undefined => {
        const targetObjectMetadataId =
          flatFieldMetadata.relationTargetObjectMetadataId;

        if (!isDefined(targetObjectMetadataId)) {
          return undefined;
        }

        const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: targetObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

        if (!isDefined(targetFlatObjectMetadata)) {
          return undefined;
        }

        return {
          joinColumnName: getJoinColumnNameForRelationField(flatFieldMetadata),
          targetObjectNameSingular: targetFlatObjectMetadata.nameSingular,
        };
      },
    )
    .filter(isDefined);
};

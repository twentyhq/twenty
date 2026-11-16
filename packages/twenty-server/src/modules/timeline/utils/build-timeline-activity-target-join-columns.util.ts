import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { FlatEntityMapsException } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-rule-target-join-column.type';

const findTimelineActivityTargetObjectMetadataIds = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Set<string> => {
  const timelineActivityFlatObjectMetadata =
    findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    });

  return new Set(
    findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: timelineActivityFlatObjectMetadata.fieldIds,
      flatEntityMaps: flatFieldMetadataMaps,
    })
      .filter(
        ({ morphId }) =>
          morphId ===
          STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      )
      .map(
        ({ relationTargetObjectMetadataId }) => relationTargetObjectMetadataId,
      )
      .filter(isDefined),
  );
};

export const buildTimelineActivityTargetJoinColumns = ({
  targetFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  targetFlatFieldMetadata: OrmFlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): TimelineActivityRuleTargetJoinColumn[] => {
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

  const timelineActivityTargetObjectMetadataIds =
    findTimelineActivityTargetObjectMetadataIds({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

  return targetFlatFieldMetadatas
    .map(
      (flatFieldMetadata): TimelineActivityRuleTargetJoinColumn | undefined => {
        const targetObjectMetadataId =
          flatFieldMetadata.relationTargetObjectMetadataId;

        if (
          !isDefined(targetObjectMetadataId) ||
          !timelineActivityTargetObjectMetadataIds.has(targetObjectMetadataId)
        ) {
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

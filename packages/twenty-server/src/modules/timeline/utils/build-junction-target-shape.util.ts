import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-rule-target-join-column.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';

type BuildJunctionTargetShapeArgs = {
  relationFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

// A junction relation is a ONE_TO_MANY field declaring, through
// settings.junctionTargetFieldId, which field of the junction object leads to
// the far side. When that field is a morph relation the whole morph group is
// expanded, so one rule reaches every target type.
export const buildJunctionTargetShape = ({
  relationFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: BuildJunctionTargetShapeArgs):
  | TimelineActivityRuleTargetShape
  | undefined => {
  const { settings } = relationFlatFieldMetadata;

  if (!isFieldMetadataSettingsOfType(settings, FieldMetadataType.RELATION)) {
    return undefined;
  }

  if (settings.relationType !== RelationType.ONE_TO_MANY) {
    return undefined;
  }

  const junctionTargetFieldId = settings.junctionTargetFieldId;

  if (!isDefined(junctionTargetFieldId)) {
    return undefined;
  }

  const { relationTargetObjectMetadataId, relationTargetFieldMetadataId } =
    relationFlatFieldMetadata;

  if (
    !isDefined(relationTargetObjectMetadataId) ||
    !isDefined(relationTargetFieldMetadataId)
  ) {
    return undefined;
  }

  const junctionFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(junctionFlatObjectMetadata)) {
    return undefined;
  }

  const junctionSourceFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationTargetFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(junctionSourceFlatFieldMetadata)) {
    return undefined;
  }

  const junctionSourceJoinColumnName = getJoinColumnNameForRelationField(
    junctionSourceFlatFieldMetadata,
  );

  const junctionTargetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: junctionTargetFieldId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(junctionTargetFlatFieldMetadata)) {
    return undefined;
  }

  const junctionTargetFlatFieldMetadatas = isFlatFieldMetadataOfType(
    junctionTargetFlatFieldMetadata,
    FieldMetadataType.MORPH_RELATION,
  )
    ? [
        junctionTargetFlatFieldMetadata,
        ...findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
          flatFieldMetadata: junctionTargetFlatFieldMetadata,
          flatFieldMetadataMaps,
          flatObjectMetadata: junctionFlatObjectMetadata,
        }),
      ]
    : [junctionTargetFlatFieldMetadata];

  const junctionTargetJoinColumns = junctionTargetFlatFieldMetadatas
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

  if (junctionTargetJoinColumns.length === 0) {
    return undefined;
  }

  return {
    kind: 'JUNCTION',
    junctionObjectMetadataId: junctionFlatObjectMetadata.id,
    junctionObjectNameSingular: junctionFlatObjectMetadata.nameSingular,
    junctionSourceJoinColumnName,
    junctionTargetJoinColumns,
  };
};

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';
import { buildTimelineActivityTargetJoinColumns } from 'src/modules/timeline/utils/build-timeline-activity-target-join-columns.util';

type BuildJunctionTargetShapeArgs = {
  relationFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

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

  const targetJoinColumns = buildTimelineActivityTargetJoinColumns({
    targetFlatFieldMetadata: junctionTargetFlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  if (targetJoinColumns.length === 0) {
    return undefined;
  }

  return {
    kind: 'JUNCTION',
    junctionObjectMetadataId: junctionFlatObjectMetadata.id,
    junctionObjectNameSingular: junctionFlatObjectMetadata.nameSingular,
    junctionSourceJoinColumnName,
    targetJoinColumns,
  };
};

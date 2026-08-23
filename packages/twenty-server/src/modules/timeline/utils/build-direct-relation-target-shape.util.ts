import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';
import { buildTimelineActivityTargetJoinColumns } from 'src/modules/timeline/utils/build-timeline-activity-target-join-columns.util';

export const buildDirectRelationTargetShape = ({
  relationFlatFieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relationFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TimelineActivityRuleTargetShape | undefined => {
  const { settings, type } = relationFlatFieldMetadata;

  if (
    (type !== FieldMetadataType.RELATION &&
      type !== FieldMetadataType.MORPH_RELATION) ||
    !isFieldMetadataSettingsOfType(settings, type) ||
    settings.relationType !== RelationType.MANY_TO_ONE
  ) {
    return undefined;
  }

  const targetJoinColumns = buildTimelineActivityTargetJoinColumns({
    targetFlatFieldMetadata: relationFlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  return targetJoinColumns.length === 0
    ? undefined
    : { kind: 'DIRECT_RELATION', targetJoinColumns };
};

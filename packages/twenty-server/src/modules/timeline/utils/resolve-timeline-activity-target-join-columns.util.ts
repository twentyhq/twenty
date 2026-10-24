import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-target-join-column.type';

export const resolveTimelineActivityTargetJoinColumns = ({
  timelineActivityFlatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  timelineActivityFlatObjectMetadata: Pick<FlatObjectMetadata, 'fieldIds'>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): TimelineActivityTargetJoinColumn[] =>
  timelineActivityFlatObjectMetadata.fieldIds.flatMap((fieldId) => {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    return flatFieldMetadata?.morphId ===
      STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId &&
      isDefined(flatFieldMetadata.relationTargetObjectMetadataId)
      ? [
          {
            joinColumnName:
              getJoinColumnNameForRelationField(flatFieldMetadata),
            objectMetadataId: flatFieldMetadata.relationTargetObjectMetadataId,
          },
        ]
      : [];
  });

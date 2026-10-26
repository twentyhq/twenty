import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { filterFieldNamesInEventProperties } from 'src/engine/core-modules/record-share/utils/filter-field-names-in-event-properties.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildReadableFieldNames } from 'src/modules/timeline/utils/build-readable-field-names.util';
import { resolveTimelineActivityObject } from 'src/modules/timeline/utils/resolve-timeline-activity-object.util';

export const redactTimelineActivityProperties = ({
  properties,
  timelineActivity,
  objectsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  properties: unknown;
  timelineActivity: Record<string, unknown>;
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Record<string, unknown> | null => {
  if (!isPlainObject(properties)) {
    return null;
  }

  const flatObjectMetadata = resolveTimelineActivityObject({
    timelineActivity,
    flatObjectMetadataMaps,
  });

  const readableFieldNames = isDefined(flatObjectMetadata)
    ? buildReadableFieldNames({
        flatObjectMetadata,
        isLinkedActivity: isNonEmptyString(
          timelineActivity.linkedObjectMetadataId,
        ),
        objectsPermissions,
        flatFieldMetadataMaps,
      })
    : new Set<string>();

  return {
    ...properties,
    ...filterFieldNamesInEventProperties({
      properties,
      isFieldNameKept: (fieldName) => readableFieldNames.has(fieldName),
    }),
  };
};

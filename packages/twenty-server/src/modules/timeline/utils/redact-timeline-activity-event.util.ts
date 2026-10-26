import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { redactTimelineActivityProperties } from 'src/modules/timeline/utils/redact-timeline-activity-properties.util';

export const redactTimelineActivityEvent = <TEvent extends ObjectRecordEvent>({
  event,
  objectsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): TEvent => {
  const { properties } = event;
  const before =
    'before' in properties && isPlainObject(properties.before)
      ? properties.before
      : undefined;
  const after =
    'after' in properties && isPlainObject(properties.after)
      ? properties.after
      : undefined;

  const redact = ({
    value,
    timelineActivity,
  }: {
    value: unknown;
    timelineActivity: Record<string, unknown> | undefined;
  }) =>
    redactTimelineActivityProperties({
      properties: value,
      timelineActivity: timelineActivity ?? {},
      objectsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

  const redactRecord = (record: Record<string, unknown>) => ({
    ...record,
    properties: redact({ value: record.properties, timelineActivity: record }),
  });

  const diff =
    'diff' in properties && isPlainObject(properties.diff)
      ? properties.diff
      : undefined;
  const diffProperties = isPlainObject(diff?.properties)
    ? diff.properties
    : undefined;

  return {
    ...event,
    properties: {
      ...properties,
      ...(isDefined(before) && { before: redactRecord(before) }),
      ...(isDefined(after) && { after: redactRecord(after) }),
      ...(isDefined(diffProperties) && {
        diff: {
          ...diff,
          properties: {
            ...diffProperties,
            before: redact({
              value: diffProperties.before,
              timelineActivity: before ?? after,
            }),
            after: redact({
              value: diffProperties.after,
              timelineActivity: after ?? before,
            }),
          },
        },
      }),
    },
  };
};

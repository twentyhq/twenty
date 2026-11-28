import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import {
  type IsTimelineActivitySourceRecordReadable,
  omitUnreadableFieldsFromTimelineActivityProperties,
} from 'src/engine/permissions/record-read-custom-permissions/handlers/timeline-activity/utils/omit-unreadable-fields-from-timeline-activity-properties.util';

export const omitUnreadableFieldsFromTimelineActivityEvent = <
  TEvent extends ObjectRecordEvent,
>({
  event,
  recordReadRestrictions,
  isSourceRecordReadable,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  recordReadRestrictions: RecordReadRestrictions;
  isSourceRecordReadable: IsTimelineActivitySourceRecordReadable;
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

  const omitUnreadableFields = ({
    value,
    timelineActivity,
  }: {
    value: unknown;
    timelineActivity: Record<string, unknown> | undefined;
  }) =>
    omitUnreadableFieldsFromTimelineActivityProperties({
      properties: value,
      timelineActivity: timelineActivity ?? {},
      recordReadRestrictions,
      isSourceRecordReadable,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

  const omitUnreadableFieldsFromRecord = (record: Record<string, unknown>) => ({
    ...record,
    properties: omitUnreadableFields({
      value: record.properties,
      timelineActivity: record,
    }),
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
      ...(isDefined(before) && {
        before: omitUnreadableFieldsFromRecord(before),
      }),
      ...(isDefined(after) && { after: omitUnreadableFieldsFromRecord(after) }),
      ...(isDefined(diffProperties) && {
        diff: {
          ...diff,
          properties: {
            ...diffProperties,
            before: omitUnreadableFields({
              value: diffProperties.before,
              timelineActivity: before ?? after,
            }),
            after: omitUnreadableFields({
              value: diffProperties.after,
              timelineActivity: after ?? before,
            }),
          },
        },
      }),
    },
  };
};

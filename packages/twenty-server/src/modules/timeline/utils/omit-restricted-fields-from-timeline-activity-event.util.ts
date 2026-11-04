import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { omitRestrictedFieldsFromTimelineActivity } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity.util';

export const omitRestrictedFieldsFromTimelineActivityEvent = <
  TEvent extends ObjectRecordEvent,
>({
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

  const omitRestrictedFields = ({
    value,
    timelineActivity,
  }: {
    value: unknown;
    timelineActivity: Record<string, unknown> | undefined;
  }) =>
    omitRestrictedFieldsFromTimelineActivity({
      properties: value,
      timelineActivity: timelineActivity ?? {},
      objectsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

  const omitRestrictedFieldsFromRecord = (record: Record<string, unknown>) => ({
    ...record,
    properties: omitRestrictedFields({
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
        before: omitRestrictedFieldsFromRecord(before),
      }),
      ...(isDefined(after) && { after: omitRestrictedFieldsFromRecord(after) }),
      ...(isDefined(diffProperties) && {
        diff: {
          ...diff,
          properties: {
            ...diffProperties,
            before: omitRestrictedFields({
              value: diffProperties.before,
              timelineActivity: before ?? after,
            }),
            after: omitRestrictedFields({
              value: diffProperties.after,
              timelineActivity: after ?? before,
            }),
          },
        },
      }),
    },
  };
};

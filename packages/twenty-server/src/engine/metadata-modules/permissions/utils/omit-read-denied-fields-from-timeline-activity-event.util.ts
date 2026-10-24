import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { omitReadDeniedFieldsFromTimelineActivityProperties } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-timeline-activity-properties.util';
import { omitReadDeniedFieldsFromTimelineActivityRecord } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-timeline-activity-record.util';

type TimelineActivityEventProperties = {
  before?: object;
  after?: object;
  diff?: Record<string, unknown>;
};

export const omitReadDeniedFieldsFromTimelineActivityEvent = <
  TEvent extends ObjectRecordEvent,
>({
  event,
  readDeniedFieldNames,
}: {
  event: TEvent;
  readDeniedFieldNames: Set<string>;
}): TEvent => {
  if (readDeniedFieldNames.size === 0) {
    return event;
  }

  const properties = event.properties as TimelineActivityEventProperties;
  const propertiesDiff = properties.diff?.properties;

  return {
    ...event,
    properties: {
      ...properties,
      ...(isDefined(properties.before) && {
        before: omitReadDeniedFieldsFromTimelineActivityRecord({
          record: properties.before,
          readDeniedFieldNames,
        }),
      }),
      ...(isDefined(properties.after) && {
        after: omitReadDeniedFieldsFromTimelineActivityRecord({
          record: properties.after,
          readDeniedFieldNames,
        }),
      }),
      ...(isPlainObject(propertiesDiff) && {
        diff: {
          ...properties.diff,
          properties: {
            ...propertiesDiff,
            before: omitReadDeniedFieldsFromTimelineActivityProperties({
              properties: propertiesDiff.before,
              readDeniedFieldNames,
            }),
            after: omitReadDeniedFieldsFromTimelineActivityProperties({
              properties: propertiesDiff.after,
              readDeniedFieldNames,
            }),
          },
        },
      }),
    },
  };
};

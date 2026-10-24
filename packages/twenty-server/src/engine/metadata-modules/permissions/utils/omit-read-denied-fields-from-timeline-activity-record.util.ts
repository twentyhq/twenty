import { isPlainObject } from 'twenty-shared/utils';

import { omitReadDeniedFieldsFromTimelineActivityProperties } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-timeline-activity-properties.util';

export const omitReadDeniedFieldsFromTimelineActivityRecord = <TRecord>({
  record,
  readDeniedFieldNames,
}: {
  record: TRecord;
  readDeniedFieldNames: Set<string>;
}): TRecord =>
  isPlainObject(record) && 'properties' in record
    ? {
        ...record,
        properties: omitReadDeniedFieldsFromTimelineActivityProperties({
          properties: record.properties,
          readDeniedFieldNames,
        }),
      }
    : record;

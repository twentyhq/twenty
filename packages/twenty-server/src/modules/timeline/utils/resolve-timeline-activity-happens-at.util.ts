import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';

const parseTimestamp = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const getRecordTimestamp = (record: object | undefined): unknown => {
  if (!isDefined(record)) {
    return undefined;
  }

  const updatedAt = 'updatedAt' in record ? record.updatedAt : undefined;

  return updatedAt ?? ('createdAt' in record ? record.createdAt : undefined);
};

export const resolveTimelineActivityHappensAt = (
  event: ObjectRecordBaseEvent,
): Date => {
  const record = event.properties.after ?? event.properties.before;
  const recordTimestamp = parseTimestamp(getRecordTimestamp(record));

  return isDefined(recordTimestamp) ? recordTimestamp : new Date();
};

// Synced records carry their own moment in time: an email happened when it was
// received and a calendar event when it starts, not when a sync or a late
// participant match wrote the row.
const LINKED_HAPPENS_AT_FIELD_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, string>
> = {
  [STANDARD_OBJECTS.message.universalIdentifier]:
    STANDARD_OBJECTS.message.fields.receivedAt.universalIdentifier,
  [STANDARD_OBJECTS.calendarEvent.universalIdentifier]:
    STANDARD_OBJECTS.calendarEvent.fields.startsAt.universalIdentifier,
};

export const resolveLinkedTimelineActivityHappensAtFieldName = ({
  sourceFlatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  sourceFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string | undefined => {
  const happensAtFieldUniversalIdentifier =
    LINKED_HAPPENS_AT_FIELD_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER[
      sourceFlatObjectMetadata.universalIdentifier
    ];

  if (!isDefined(happensAtFieldUniversalIdentifier)) {
    return undefined;
  }

  return findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: happensAtFieldUniversalIdentifier,
  })?.name;
};

export const parseLinkedTimelineActivityHappensAt = (
  value: unknown,
): Date | undefined => parseTimestamp(value);

export const resolveLinkedTimelineActivityHappensAt = ({
  event,
  ruleAction,
  sourceFlatObjectMetadata,
  sourceRecord,
  flatFieldMetadataMaps,
}: {
  event: ObjectRecordBaseEvent;
  ruleAction: TimelineActivityRuleAction;
  sourceFlatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>;
  sourceRecord: Record<string, unknown> | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Date => {
  const happensAtFieldName =
    ruleAction === 'linked'
      ? resolveLinkedTimelineActivityHappensAtFieldName({
          sourceFlatObjectMetadata,
          flatFieldMetadataMaps,
        })
      : undefined;

  const sourceRecordHappensAt = isDefined(happensAtFieldName)
    ? parseTimestamp(sourceRecord?.[happensAtFieldName])
    : undefined;

  return sourceRecordHappensAt ?? resolveTimelineActivityHappensAt(event);
};

import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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

export const parseLinkedTimelineActivityHappensAt = (
  value: unknown,
): Date | undefined => parseTimestamp(value);

// Synced records carry their own moment in time: an email happened when it was
// received and a calendar event when it starts, not when a sync or a late
// participant match wrote the row. The timeline activity type declares which
// source field holds that moment; the rule resolves it to a field name.
export const resolveLinkedTimelineActivityHappensAt = ({
  event,
  ruleAction,
  happensAtFieldName,
  sourceRecord,
}: {
  event: ObjectRecordBaseEvent;
  ruleAction: TimelineActivityRuleAction;
  happensAtFieldName: string | null;
  sourceRecord: Record<string, unknown> | undefined;
}): Date => {
  const sourceRecordHappensAt =
    ruleAction === 'linked' && isDefined(happensAtFieldName)
      ? parseTimestamp(sourceRecord?.[happensAtFieldName])
      : undefined;

  return sourceRecordHappensAt ?? resolveTimelineActivityHappensAt(event);
};

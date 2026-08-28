import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { doesObjectRecordEventChangeFields } from 'src/modules/timeline/utils/does-object-record-event-change-fields.util';
import { resolveLinkedTimelineActivityHappensAtFieldName } from 'src/modules/timeline/utils/resolve-timeline-activity-happens-at.util';
import { resolveTimelineActivityTypeForRule } from 'src/modules/timeline/utils/resolve-timeline-activity-type-for-rule.util';
import { type TimelineActivityTypeResolver } from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

export type LinkedTimelineActivityHappensAtSyncUpdate = {
  sourceObjectNameSingular: string;
  happensAtFieldName: string;
  timelineActivityTypeIds: string[];
  linkedRecordIds: string[];
};

// A linked activity is anchored at its source record's own moment (an email's
// receivedAt, a calendar event's startsAt), so when that moment moves, e.g. a
// meeting gets rescheduled, the already written activities must follow. Only
// the changed record ids are collected here: the new value is read from the
// source row at write time, not from the event snapshot.
export const buildLinkedTimelineActivityHappensAtSyncUpdates = ({
  rules,
  events,
  flatFieldMetadataMaps,
  resolveTimelineActivityType,
}: {
  rules: TimelineActivityRule[];
  events: ObjectRecordBaseEvent[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  resolveTimelineActivityType: TimelineActivityTypeResolver;
}): LinkedTimelineActivityHappensAtSyncUpdate[] => {
  const linkedRules = rules.filter(
    (rule) =>
      rule.targetShape.kind !== 'SELF' && rule.actions.includes('linked'),
  );

  if (linkedRules.length === 0) {
    return [];
  }

  const updates: LinkedTimelineActivityHappensAtSyncUpdate[] = [];

  for (const rule of linkedRules) {
    const happensAtFieldName = resolveLinkedTimelineActivityHappensAtFieldName({
      sourceFlatObjectMetadata: rule.sourceFlatObjectMetadata,
      flatFieldMetadataMaps,
    });

    const timelineActivityTypeId = resolveTimelineActivityTypeForRule({
      rule,
      ruleAction: 'linked',
      resolveTimelineActivityType,
    })?.id;

    if (!isDefined(happensAtFieldName) || !isDefined(timelineActivityTypeId)) {
      continue;
    }

    const linkedRecordIds = [
      ...new Set(
        events
          .filter((event) =>
            doesObjectRecordEventChangeFields({
              event,
              fieldNames: [happensAtFieldName],
            }),
          )
          .map((event) => event.recordId),
      ),
    ];

    if (linkedRecordIds.length === 0) {
      continue;
    }

    updates.push({
      sourceObjectNameSingular: rule.sourceFlatObjectMetadata.nameSingular,
      happensAtFieldName,
      timelineActivityTypeIds: [timelineActivityTypeId],
      linkedRecordIds,
    });
  }

  return updates;
};

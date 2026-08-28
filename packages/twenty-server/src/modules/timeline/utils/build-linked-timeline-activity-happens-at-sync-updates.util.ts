import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { doesObjectRecordEventChangeFields } from 'src/modules/timeline/utils/does-object-record-event-change-fields.util';
import {
  parseLinkedTimelineActivityHappensAt,
  resolveLinkedTimelineActivityHappensAtFieldName,
} from 'src/modules/timeline/utils/resolve-timeline-activity-happens-at.util';
import { type TimelineActivityTypeResolver } from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

export type LinkedTimelineActivityHappensAtSyncUpdate = {
  linkedRecordId: string;
  timelineActivityTypeIds: string[];
  happensAt: Date;
};

// A linked activity is anchored at its source record's own moment (an email's
// receivedAt, a calendar event's startsAt), so when that moment moves, e.g. a
// meeting gets rescheduled, the already written activities must follow.
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

  const updateByLinkedRecordId = new Map<
    string,
    { timelineActivityTypeIds: Set<string>; happensAt: Date }
  >();

  for (const rule of linkedRules) {
    const happensAtFieldName = resolveLinkedTimelineActivityHappensAtFieldName({
      sourceFlatObjectMetadata: rule.sourceFlatObjectMetadata,
      flatFieldMetadataMaps,
    });

    const timelineActivityTypeId = (
      rule.timelineActivityType ??
      resolveTimelineActivityType({
        action: 'linked',
        objectUniversalIdentifier:
          rule.sourceFlatObjectMetadata.universalIdentifier,
      })
    )?.id;

    if (!isDefined(happensAtFieldName) || !isDefined(timelineActivityTypeId)) {
      continue;
    }

    for (const event of events) {
      if (
        !doesObjectRecordEventChangeFields({
          event,
          fieldNames: [happensAtFieldName],
        })
      ) {
        continue;
      }

      const happensAt = parseLinkedTimelineActivityHappensAt(
        (event.properties.after as Record<string, unknown> | undefined)?.[
          happensAtFieldName
        ],
      );

      if (!isDefined(happensAt)) {
        continue;
      }

      const update = updateByLinkedRecordId.get(event.recordId);

      if (isDefined(update)) {
        update.timelineActivityTypeIds.add(timelineActivityTypeId);
        update.happensAt = happensAt;
      } else {
        updateByLinkedRecordId.set(event.recordId, {
          timelineActivityTypeIds: new Set([timelineActivityTypeId]),
          happensAt,
        });
      }
    }
  }

  return [...updateByLinkedRecordId.entries()].map(
    ([linkedRecordId, { timelineActivityTypeIds, happensAt }]) => ({
      linkedRecordId,
      timelineActivityTypeIds: [...timelineActivityTypeIds],
      happensAt,
    }),
  );
};

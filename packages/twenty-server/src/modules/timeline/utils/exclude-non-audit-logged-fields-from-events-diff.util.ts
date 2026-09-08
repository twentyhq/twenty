import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

// A diff emptied by this filter yields no timeline activity at all: the rules
// downstream drop updates that have nothing left to show.
export const excludeNonAuditLoggedFieldsFromEventsDiff = ({
  events,
  nonAuditLoggedFieldNames,
}: {
  events: ObjectRecordBaseEvent[];
  nonAuditLoggedFieldNames: Set<string>;
}): ObjectRecordBaseEvent[] => {
  if (nonAuditLoggedFieldNames.size === 0) {
    return events;
  }

  return events.map((event) => {
    const { diff } = event.properties;

    if (!isDefined(diff)) {
      return event;
    }

    const auditLoggedDiffEntries = Object.entries(diff).filter(
      ([fieldName]) => !nonAuditLoggedFieldNames.has(fieldName),
    );

    if (auditLoggedDiffEntries.length === Object.keys(diff).length) {
      return event;
    }

    return {
      ...event,
      properties: {
        ...event.properties,
        diff: Object.fromEntries(auditLoggedDiffEntries),
      },
    };
  });
};

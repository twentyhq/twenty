import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

const doesEventDiffCarryFieldNames = ({
  event,
  fieldNames,
}: {
  event: ObjectRecordBaseEvent;
  fieldNames: ReadonlySet<string>;
}): boolean =>
  isDefined(event.properties.diff) &&
  Object.keys(event.properties.diff).some((fieldName) =>
    fieldNames.has(fieldName),
  );

// A diff emptied by this filter yields no timeline activity at all: the rules
// downstream drop updates that have nothing left to show.
export const excludeNonAuditLoggedFieldsFromEventsDiff = ({
  events,
  nonAuditLoggedFieldNames,
}: {
  events: ObjectRecordBaseEvent[];
  nonAuditLoggedFieldNames: ReadonlySet<string>;
}): ObjectRecordBaseEvent[] => {
  const isFilteringNeeded = events.some((event) =>
    doesEventDiffCarryFieldNames({
      event,
      fieldNames: nonAuditLoggedFieldNames,
    }),
  );

  if (!isFilteringNeeded) {
    return events;
  }

  return events.map((event) => {
    const { diff } = event.properties;

    if (!isDefined(diff)) {
      return event;
    }

    return {
      ...event,
      properties: {
        ...event.properties,
        diff: Object.fromEntries(
          Object.entries(diff).filter(
            ([fieldName]) => !nonAuditLoggedFieldNames.has(fieldName),
          ),
        ),
      },
    };
  });
};

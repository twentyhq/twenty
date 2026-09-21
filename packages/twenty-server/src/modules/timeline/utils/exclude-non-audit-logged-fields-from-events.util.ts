import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

const doesEventCarryFieldNames = ({
  event,
  fieldNames,
}: {
  event: ObjectRecordBaseEvent;
  fieldNames: ReadonlySet<string>;
}): boolean =>
  [
    ...Object.keys(event.properties.diff ?? {}),
    ...(event.properties.updatedFields ?? []),
  ].some((fieldName) => fieldNames.has(fieldName));

// A diff emptied by this filter yields no timeline activity at all: the rules
// downstream drop updates that have nothing left to show. updatedFields is
// filtered alongside it because the relation rules read that list instead of
// the diff, and the two have to agree on what the event touched.
export const excludeNonAuditLoggedFieldsFromEvents = ({
  events,
  nonAuditLoggedFieldNames,
}: {
  events: ObjectRecordBaseEvent[];
  nonAuditLoggedFieldNames: ReadonlySet<string>;
}): ObjectRecordBaseEvent[] => {
  return events.map((event) => {
    if (
      !doesEventCarryFieldNames({
        event,
        fieldNames: nonAuditLoggedFieldNames,
      })
    ) {
      return event;
    }

    const { diff, updatedFields } = event.properties;

    return {
      ...event,
      properties: {
        ...event.properties,
        ...(isDefined(diff)
          ? {
              diff: Object.fromEntries(
                Object.entries(diff).filter(
                  ([fieldName]) => !nonAuditLoggedFieldNames.has(fieldName),
                ),
              ),
            }
          : {}),
        ...(isDefined(updatedFields)
          ? {
              updatedFields: updatedFields.filter(
                (fieldName) => !nonAuditLoggedFieldNames.has(fieldName),
              ),
            }
          : {}),
      },
    };
  });
};

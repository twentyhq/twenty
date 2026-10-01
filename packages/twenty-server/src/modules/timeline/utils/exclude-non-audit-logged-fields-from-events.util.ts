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

// updatedFields is filtered too because the relation rules read it instead of the diff
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

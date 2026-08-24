import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

export const doesTimelineActivityLinkChange = ({
  event,
  joinColumnNames,
}: {
  event: ObjectRecordBaseEvent;
  joinColumnNames: string[];
}): boolean => {
  const { updatedFields, diff } = event.properties;

  if (isDefined(updatedFields)) {
    return joinColumnNames.some((joinColumnName) =>
      updatedFields.includes(joinColumnName),
    );
  }

  return (
    isDefined(diff) &&
    joinColumnNames.some((joinColumnName) =>
      Object.prototype.hasOwnProperty.call(diff, joinColumnName),
    )
  );
};

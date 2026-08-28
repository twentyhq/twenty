import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

export const doesObjectRecordEventChangeFields = ({
  event,
  fieldNames,
}: {
  event: ObjectRecordBaseEvent;
  fieldNames: string[];
}): boolean => {
  const { updatedFields, diff } = event.properties;

  if (isDefined(updatedFields)) {
    return fieldNames.some((fieldName) => updatedFields.includes(fieldName));
  }

  return (
    isDefined(diff) &&
    fieldNames.some((fieldName) =>
      Object.prototype.hasOwnProperty.call(diff, fieldName),
    )
  );
};

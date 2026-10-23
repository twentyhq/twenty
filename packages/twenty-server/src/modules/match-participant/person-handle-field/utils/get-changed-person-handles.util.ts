import { isDefined } from 'twenty-shared/utils';

import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { getCanonicalPersonHandles } from 'src/modules/match-participant/person-handle-field/utils/get-canonical-person-handles.util';
import { getPersonFieldValue } from 'src/modules/match-participant/person-handle-field/utils/get-person-field-value.util';

const getHandles = ({
  personHandleField,
  person,
}: {
  personHandleField: PersonHandleField;
  person: object | null;
}): string[] => {
  if (!isDefined(person)) {
    return [];
  }

  const { primary, additional } = getCanonicalPersonHandles({
    type: personHandleField.type,
    value: getPersonFieldValue({ person, fieldName: personHandleField.name }),
  });

  return [...primary, ...additional];
};

// both sides of each change that moved the field's values; unchanged people contribute nothing
export const getChangedPersonHandles = ({
  personHandleField,
  personChanges,
}: {
  personHandleField: PersonHandleField;
  personChanges: {
    before: object | null;
    after: object;
  }[];
}): string[] => [
  ...new Set(
    personChanges.flatMap(({ before, after }) => {
      const handlesBefore = getHandles({ personHandleField, person: before });
      const handlesAfter = getHandles({ personHandleField, person: after });
      const isUnchanged =
        handlesBefore.length === handlesAfter.length &&
        handlesBefore.every((handle) => handlesAfter.includes(handle));

      return isUnchanged ? [] : [...handlesBefore, ...handlesAfter];
    }),
  ),
];

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

type PersonChange = {
  personId: string;
  before: object | null;
  after: object | null;
};

export const getChangedPersonHandles = ({
  personHandleField,
  personChanges,
}: {
  personHandleField: PersonHandleField;
  personChanges: PersonChange[];
}): { handles: string[]; changedPersonIds: string[] } => {
  const handles = new Set<string>();
  const changedPersonIds = new Set<string>();

  for (const { personId, before, after } of personChanges) {
    const handlesBefore = new Set(
      getHandles({ personHandleField, person: before }),
    );
    const handlesAfter = new Set(
      getHandles({ personHandleField, person: after }),
    );
    const isUnchanged =
      handlesBefore.size === handlesAfter.size &&
      [...handlesBefore].every((handle) => handlesAfter.has(handle));

    if (isUnchanged) {
      continue;
    }

    changedPersonIds.add(personId);

    for (const handle of [...handlesBefore, ...handlesAfter]) {
      handles.add(handle);
    }
  }

  return { handles: [...handles], changedPersonIds: [...changedPersonIds] };
};

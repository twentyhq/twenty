import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { getCanonicalPersonHandles } from 'src/modules/match-participant/person-handle-field/utils/get-canonical-person-handles.util';
import { getPersonFieldValue } from 'src/modules/match-participant/person-handle-field/utils/get-person-field-value.util';

// people must come oldest first: a primary value wins over an additional one, then the oldest person, as for emails
export const findPersonByCanonicalHandle = ({
  people,
  personHandleField,
  handle,
}: {
  people: PersonWorkspaceEntity[];
  personHandleField: PersonHandleField;
  handle: string;
}): PersonWorkspaceEntity | undefined => {
  const peopleWithHandles = people.map((person) => ({
    person,
    handles: getCanonicalPersonHandles({
      type: personHandleField.type,
      value: getPersonFieldValue({ person, fieldName: personHandleField.name }),
    }),
  }));

  return (
    peopleWithHandles.find(({ handles }) => handles.primary.includes(handle)) ??
    peopleWithHandles.find(({ handles }) => handles.additional.includes(handle))
  )?.person;
};

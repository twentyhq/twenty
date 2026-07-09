import { isNonEmptyString } from '@sniptt/guards';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findPersonByPrimaryOrAdditionalPhone = ({
  people,
  phoneNumber,
}: {
  people: PersonWorkspaceEntity[];
  phoneNumber: string;
}): PersonWorkspaceEntity | undefined => {
  if (!isNonEmptyString(phoneNumber)) {
    return undefined;
  }

  const personWithPrimaryPhone = people.find(
    (person) => person.phones?.primaryPhoneNumber === phoneNumber,
  );

  if (personWithPrimaryPhone) {
    return personWithPrimaryPhone;
  }

  const personWithAdditionalPhone = people.find((person) => {
    const additionalPhones = person.phones?.additionalPhones;

    if (!Array.isArray(additionalPhones)) {
      return false;
    }

    return additionalPhones.some(
      (additionalPhone) => additionalPhone.number === phoneNumber,
    );
  });

  return personWithAdditionalPhone;
};

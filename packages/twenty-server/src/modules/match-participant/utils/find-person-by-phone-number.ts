import { parsePhoneNumber } from 'libphonenumber-js/max';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findPersonByPhoneNumber = ({
  people,
  phoneNumber,
}: {
  people: PersonWorkspaceEntity[];
  phoneNumber: string;
}): PersonWorkspaceEntity | undefined => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

  const personWithPrimaryPhoneNumber = people.find(
    (person) =>
      person.phones.primaryPhoneNumber === parsedPhoneNumber.nationalNumber &&
      person.phones.primaryPhoneCallingCode ===
        parsedPhoneNumber.countryCallingCode,
  );

  if (personWithPrimaryPhoneNumber) {
    return personWithPrimaryPhoneNumber;
  }

  const personWithAdditionalPhoneNumber = people.find((person) => {
    const additionalPhoneNumbers = person.phones.additionalPhones;

    if (!Array.isArray(additionalPhoneNumbers)) {
      return false;
    }

    return additionalPhoneNumbers.some(
      (phoneNumber) =>
        phoneNumber.number === parsedPhoneNumber.nationalNumber &&
        phoneNumber.callingCode === parsedPhoneNumber.countryCallingCode,
    );
  });

  return personWithAdditionalPhoneNumber;
};

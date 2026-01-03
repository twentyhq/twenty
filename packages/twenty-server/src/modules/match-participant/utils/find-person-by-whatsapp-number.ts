import { parsePhoneNumber } from 'libphonenumber-js/max';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findPersonByWhatsAppNumber = ({
  people,
  phoneNumber,
}: {
  people: PersonWorkspaceEntity[];
  phoneNumber: string;
}): PersonWorkspaceEntity | undefined => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

  return people.find(
    (person) =>
      person.whatsAppPhoneNumber.primaryPhoneNumber ===
        parsedPhoneNumber.nationalNumber &&
      person.whatsAppPhoneNumber.primaryPhoneCallingCode ===
        parsedPhoneNumber.countryCallingCode,
  );
};

import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { findPersonByPrimaryOrAdditionalPhone } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { parsePhoneHandle } from 'src/utils/parse-phone-handle';

export const computePhoneContactsThatNeedPersonCreateAndRestore = ({
  uniqueContacts,
  alreadyCreatedPeople,
}: {
  uniqueContacts: Contact[];
  alreadyCreatedPeople: PersonWorkspaceEntity[];
}): {
  contactsThatNeedPersonCreate: Contact[];
  contactsThatNeedPersonRestore: Contact[];
  existingPersonByHandle: Map<string, PersonWorkspaceEntity>;
} => {
  const existingPersonByHandle = new Map<string, PersonWorkspaceEntity>();

  for (const contact of uniqueContacts) {
    const parsedPhone = parsePhoneHandle(contact.handle);

    if (!isDefined(parsedPhone)) {
      continue;
    }

    const existingPerson = findPersonByPrimaryOrAdditionalPhone({
      people: alreadyCreatedPeople,
      phoneNumber: parsedPhone.primaryPhoneNumber,
    });

    if (!isDefined(existingPerson)) {
      continue;
    }

    existingPersonByHandle.set(contact.handle.toLowerCase(), existingPerson);
  }

  const contactsThatNeedPersonCreate = uniqueContacts.filter(
    (contact) => !existingPersonByHandle.has(contact.handle.toLowerCase()),
  );

  const contactsThatNeedPersonRestore = uniqueContacts.filter((contact) => {
    const existingPerson = existingPersonByHandle.get(
      contact.handle.toLowerCase(),
    );

    if (!isDefined(existingPerson)) {
      return false;
    }

    return !isNull(existingPerson.deletedAt);
  });

  return {
    contactsThatNeedPersonCreate,
    contactsThatNeedPersonRestore,
    existingPersonByHandle,
  };
};

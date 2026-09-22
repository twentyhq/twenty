import uniq from 'lodash.uniq';
import uniqBy from 'lodash.uniqby';

import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';

export function getUniqueContactsAndHandles(contacts: Contact[]): {
  uniqueContacts: Contact[];
  uniqueHandles: string[];
} {
  if (contacts.length === 0) {
    return { uniqueContacts: [], uniqueHandles: [] };
  }

  const normalizedContacts = contacts.map((contact) => ({
    ...contact,
    handle: normalizeEmailAddress(contact.handle),
  }));
  const uniqueHandles = uniq(
    normalizedContacts.map((contact) => contact.handle),
  );

  const uniqueContacts = uniqBy(
    normalizedContacts,
    (contact) => contact.handle,
  );

  return { uniqueContacts, uniqueHandles };
}

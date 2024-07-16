import uniq from 'lodash.uniq';
import uniqBy from 'lodash.uniqby';

import { Contact } from 'src/modules/contact-creation-manager/types/contact.type';

export function getUniqueContactsAndHandles(contacts: Contact[]): {
  uniqueContacts: Contact[];
  uniqueHandles: string[];
} {
  if (contacts.length === 0) {
    return { uniqueContacts: [], uniqueHandles: [] };
  }

  const uniqueHandles = uniq(contacts.map((participant) => participant.handle));

  const uniqueContacts = uniqBy(contacts, 'handle');

  return { uniqueContacts, uniqueHandles };
}

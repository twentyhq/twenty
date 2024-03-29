import uniq from 'lodash.uniq';
import uniqBy from 'lodash.uniqby';

import { Contacts } from 'src/modules/connected-account/auto-companies-and-contacts-creation/types/contact.type';

export function getUniqueContactsAndHandles(contacts: Contacts): {
  uniqueContacts: Contacts;
  uniqueHandles: string[];
} {
  if (contacts.length === 0) {
    return { uniqueContacts: [], uniqueHandles: [] };
  }

  const uniqueHandles = uniq(contacts.map((participant) => participant.handle));

  const uniqueContacts = uniqBy(contacts, 'handle');

  return { uniqueContacts, uniqueHandles };
}

import { isDefined } from 'twenty-shared/utils';

import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { parsePhoneHandle } from 'src/utils/parse-phone-handle';

export const splitContactsByHandleType = (
  contacts: Contact[],
): { emailContacts: Contact[]; phoneContacts: Contact[] } => {
  const phoneContacts = contacts.filter((contact) =>
    isDefined(parsePhoneHandle(contact.handle)),
  );
  const emailContacts = contacts.filter(
    (contact) => !isDefined(parsePhoneHandle(contact.handle)),
  );

  return { emailContacts, phoneContacts };
};

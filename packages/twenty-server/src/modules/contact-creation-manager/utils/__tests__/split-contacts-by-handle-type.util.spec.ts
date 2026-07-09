import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { splitContactsByHandleType } from 'src/modules/contact-creation-manager/utils/split-contacts-by-handle-type.util';

describe('splitContactsByHandleType', () => {
  const phoneContact: Contact = {
    handle: '14155552671',
    displayName: 'John Doe',
  };
  const emailContact: Contact = {
    handle: 'john.doe@company.com',
    displayName: 'John Doe',
  };

  it('should split phone-handle contacts from email-handle contacts', () => {
    const { emailContacts, phoneContacts } = splitContactsByHandleType([
      emailContact,
      phoneContact,
    ]);

    expect(emailContacts).toEqual([emailContact]);
    expect(phoneContacts).toEqual([phoneContact]);
  });

  it('should keep contacts with unparseable handles on the email side', () => {
    const unparseableContact: Contact = {
      handle: 'not-an-email-or-phone',
      displayName: 'Unknown',
    };

    const { emailContacts, phoneContacts } = splitContactsByHandleType([
      unparseableContact,
    ]);

    expect(emailContacts).toEqual([unparseableContact]);
    expect(phoneContacts).toEqual([]);
  });
});

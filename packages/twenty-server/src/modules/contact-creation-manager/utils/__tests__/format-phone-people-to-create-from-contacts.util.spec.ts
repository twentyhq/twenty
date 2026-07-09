import {
  ConnectedAccountProvider,
  FieldActorSource,
} from 'twenty-shared/types';

import { formatPhonePeopleToCreateFromContacts } from 'src/modules/contact-creation-manager/utils/format-phone-people-to-create-from-contacts.util';

describe('formatPhonePeopleToCreateFromContacts', () => {
  const createdBy = {
    source: FieldActorSource.EMAIL,
    workspaceMember: null,
    context: {
      provider: ConnectedAccountProvider.GOOGLE,
    },
  };

  it('should create a phone person with phones populated and no email or company', () => {
    const [person] = formatPhonePeopleToCreateFromContacts({
      contactsToCreate: [{ handle: '14155552671', displayName: 'John Doe' }],
      createdBy,
    });

    expect(person.phones).toEqual({
      primaryPhoneNumber: '4155552671',
      primaryPhoneCallingCode: '+1',
      primaryPhoneCountryCode: 'US',
      additionalPhones: null,
    });
    expect(person.name).toEqual({ firstName: 'John', lastName: 'Doe' });
    expect(person.emails).toBeUndefined();
    expect(person.companyId).toBeUndefined();
    expect(person.createdBy?.source).toBe(FieldActorSource.EMAIL);
  });

  it('should skip contacts whose handle is not a phone number', () => {
    const people = formatPhonePeopleToCreateFromContacts({
      contactsToCreate: [
        { handle: 'john.doe@company.com', displayName: 'John Doe' },
      ],
      createdBy,
    });

    expect(people).toEqual([]);
  });
});

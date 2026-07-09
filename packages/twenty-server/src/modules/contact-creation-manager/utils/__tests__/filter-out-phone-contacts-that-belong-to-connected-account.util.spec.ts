import { filterOutPhoneContactsThatBelongToConnectedAccount } from 'src/modules/contact-creation-manager/utils/filter-out-phone-contacts-that-belong-to-connected-account.util';

describe('filterOutPhoneContactsThatBelongToConnectedAccount', () => {
  it('keeps phone contacts when the connected account handle is not a phone number', () => {
    const contacts = [
      { handle: '919876543210', displayName: 'Jane' },
      { handle: '15551675247', displayName: '' },
    ];

    expect(
      filterOutPhoneContactsThatBelongToConnectedAccount(contacts, {
        handle: 'WhatsApp #1',
        handleAliases: null,
      }),
    ).toEqual(contacts);
  });

  it('filters out contacts matching the connected account phone handle', () => {
    const contacts = [
      { handle: '919876543210', displayName: 'Jane' },
      { handle: '+919876543210', displayName: 'Jane Plus' },
      { handle: '15551675247', displayName: 'Other' },
    ];

    expect(
      filterOutPhoneContactsThatBelongToConnectedAccount(contacts, {
        handle: '919876543210',
        handleAliases: null,
      }),
    ).toEqual([{ handle: '15551675247', displayName: 'Other' }]);
  });

  it('filters out contacts matching a phone handle alias', () => {
    const contacts = [{ handle: '15551675247', displayName: 'Business' }];

    expect(
      filterOutPhoneContactsThatBelongToConnectedAccount(contacts, {
        handle: 'WhatsApp #1',
        handleAliases: ['+1 (555) 167-5247'],
      }),
    ).toEqual([]);
  });
});

import {
  formatEmailAddressWithDisplayName,
  parseEmailAddressList,
} from '@/utils';

describe('formatEmailAddressWithDisplayName', () => {
  it('should return the bare address when there is no display name', () => {
    expect(
      formatEmailAddressWithDisplayName({ address: 'jane@example.com' }),
    ).toBe('jane@example.com');
  });

  it('should format a display name with angle brackets', () => {
    expect(
      formatEmailAddressWithDisplayName({
        address: 'jane@example.com',
        displayName: 'Jane Doe',
      }),
    ).toBe('Jane Doe <jane@example.com>');
  });

  it('should quote display names containing special characters', () => {
    expect(
      formatEmailAddressWithDisplayName({
        address: 'jane@example.com',
        displayName: 'Doe, Jane',
      }),
    ).toBe('"Doe, Jane" <jane@example.com>');
  });

  it('should round trip through parseEmailAddressList', () => {
    const emailAddress = {
      address: 'jane@example.com',
      displayName: 'Doe, Jane "JD"',
    };

    expect(
      parseEmailAddressList(formatEmailAddressWithDisplayName(emailAddress)),
    ).toEqual([emailAddress]);
  });
});

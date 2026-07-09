import { getFirstNameAndLastNameFromPhoneDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-phone-display-name.util';

describe('getFirstNameAndLastNameFromPhoneDisplayName', () => {
  it('should parse and capitalize the display name', () => {
    expect(getFirstNameAndLastNameFromPhoneDisplayName('john doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should return an empty name when the display name is empty', () => {
    expect(getFirstNameAndLastNameFromPhoneDisplayName('')).toEqual({
      firstName: '',
      lastName: '',
    });
  });

  it('should return an empty name when the display name is a phone number', () => {
    expect(
      getFirstNameAndLastNameFromPhoneDisplayName('+1 (415) 555-2671'),
    ).toEqual({
      firstName: '',
      lastName: '',
    });
  });
});

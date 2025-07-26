import handleQueryParams from '../../utils/handleQueryParams';

describe('utils.handleQueryParams', () => {
  test('should handle empty values', () => {
    const inputData = {};
    const result = handleQueryParams(inputData);
    const expectedResult = '';
    expect(result).toEqual(expectedResult);
  });
  test('should format', () => {
    const inputData = {
      name: 'Company Name',
      address: { addressCity: 'Paris' },
      domainName: 'Company Domain Name',
      linkedinUrl__url: '/linkedin_url',
      linkedinUrl__label: 'Test linkedinUrl',
      whatsapp__primaryLinkUrl: '/whatsapp_url',
      whatsapp__primaryLinkLabel: 'Whatsapp Link',
      whatsapp__secondaryLinks: [
        "{url: '/secondary_whatsapp_url',label: 'Secondary Whatsapp Link'}",
      ],
      emails: {
        primaryEmail: 'primary@email.com',
        additionalEmails: ['secondary@email.com'],
      },
      phones: {
        primaryPhoneNumber: '322110011',
        primaryPhoneCountryCode: 'FR',
        primaryPhoneCallingCode: '+33',
        additionalPhones: [
          "{ phoneNumber: '322110012', countryCode: 'FR', callingCode: '+33' }",
        ],
      },
      xUrl__url: '/x_url',
      xUrl__label: 'Test xUrl',
      annualRecurringRevenue: 100000,
      idealCustomerProfile: true,
      employees: 25,
    };
    const result = handleQueryParams(inputData);
    const expectedResult =
      'name: "Company Name", ' +
      'address: {addressCity: "Paris"}, ' +
      'domainName: "Company Domain Name", ' +
      'linkedinUrl: {url: "/linkedin_url", label: "Test linkedinUrl"}, ' +
      'whatsapp: {primaryLinkUrl: "/whatsapp_url", primaryLinkLabel: "Whatsapp Link", secondaryLinks: [{url: \'/secondary_whatsapp_url\',label: \'Secondary Whatsapp Link\'}]}, ' +
      'emails: {primaryEmail: "primary@email.com", additionalEmails: ["secondary@email.com"]}, ' +
      'phones: {primaryPhoneNumber: "322110011", primaryPhoneCountryCode: "FR", primaryPhoneCallingCode: "+33", additionalPhones: [{ phoneNumber: \'322110012\', countryCode: \'FR\', callingCode: \'+33\' }]}, ' +
      'xUrl: {url: "/x_url", label: "Test xUrl"}, ' +
      'annualRecurringRevenue: 100000, ' +
      'idealCustomerProfile: true, ' +
      'employees: 25';
    expect(result).toEqual(expectedResult);
  });
});

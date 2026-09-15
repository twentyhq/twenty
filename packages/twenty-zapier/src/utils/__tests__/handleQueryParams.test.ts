import { FieldMetadataType } from 'twenty-shared/types';
import { type Node } from 'src/utils/data.types';
import handleQueryParams from 'src/utils/handleQueryParams';

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
  test('should not quote Select, Multi Select and Rating enum values', () => {
    const inputData = {
      name: 'Opportunity Name',
      stage: 'SCREENING',
      tags: ['URGENT', 'VIP'],
      rating: 'RATING_3',
    };
    const node: Node = {
      nameSingular: 'opportunity',
      namePlural: 'opportunities',
      labelSingular: 'Opportunity',
      fields: {
        edges: [
          {
            node: {
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              description: null,
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: FieldMetadataType.SELECT,
              name: 'stage',
              label: 'Stage',
              description: null,
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: FieldMetadataType.MULTI_SELECT,
              name: 'tags',
              label: 'Tags',
              description: null,
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: FieldMetadataType.RATING,
              name: 'rating',
              label: 'Rating',
              description: null,
              isNullable: true,
              defaultValue: null,
            },
          },
        ],
      },
    };
    const result = handleQueryParams(inputData, node);
    const expectedResult =
      'name: "Opportunity Name", stage: SCREENING, tags: [URGENT, VIP], rating: RATING_3';
    expect(result).toEqual(expectedResult);
  });
});

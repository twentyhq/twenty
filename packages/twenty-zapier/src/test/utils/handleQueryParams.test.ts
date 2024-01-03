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
      address: 'Company Address',
      domainName: 'Company Domain Name',
      linkedinUrl__url: '/linkedin_url',
      linkedinUrl__label: 'Test linkedinUrl',
      xUrl__url: '/x_url',
      xUrl__label: 'Test xUrl',
      annualRecurringRevenue: 100000,
      idealCustomerProfile: true,
      employees: 25,
    };
    const result = handleQueryParams(inputData);
    const expectedResult =
      'name: "Company Name", ' +
      'address: "Company Address", ' +
      'domainName: "Company Domain Name", ' +
      'linkedinUrl: {url: "/linkedin_url", label: "Test linkedinUrl"}, ' +
      'xUrl: {url: "/x_url", label: "Test xUrl"}, ' +
      'annualRecurringRevenue: 100000, ' +
      'idealCustomerProfile: true, ' +
      'employees: 25';
    expect(result).toEqual(expectedResult);
  });
});

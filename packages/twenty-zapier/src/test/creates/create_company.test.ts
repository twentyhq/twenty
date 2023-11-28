import App from '../../index';
import { Bundle, createAppTester, tools, ZObject } from 'zapier-platform-core';
import getBundle from '../../utils/getBundle';
import requestDb from '../../utils/requestDb';
const appTester = createAppTester(App);
tools.env.inject;

describe('creates.create_company', () => {
  test('should run', async () => {
    const bundle = getBundle({
      name: 'Company Name',
      address: 'Company Address',
      domainName: 'Company Domain Name',
      linkedinLink: {url: '/linkedin_url', label: "Test linkedinUrl"},
      xLink: {url: '/x_url', label: "Test xUrl"},
      annualRecurringRevenue: {amountMicros:100000000000,currencyCode: 'USD'},
      idealCustomerProfile: true,
      employees: 25,
    });
    const result = await appTester(
      App.creates.create_company.operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.data?.createCompany?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findCompany {company(filter: {id: {eq: "${result.data.createCompany.id}"}}){id annualRecurringRevenue{amountMicros currencyCode}}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.company.annualRecurringRevenue.amountMicros).toEqual(
      100000000000,
    );
  });
  test('should run with not required params', async () => {
    const bundle = getBundle({});
    const result = await appTester(
      App.creates.create_company.operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.data?.createCompany?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findCompany {company(filter: {id: {eq: "${result.data.createCompany.id}"}}){id annualRecurringRevenue{amountMicros currencyCode}}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.company.annualRecurringRevenue.amountMicros).toEqual(
      null,
    );
  });
});

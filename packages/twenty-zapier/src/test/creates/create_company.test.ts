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
      linkedinUrl: 'Test linkedinUrl',
      xUrl: 'Test xUrl',
      annualRecurringRevenue: 100000,
      idealCustomerProfile: true,
      employees: 25,
    });
    const result = await appTester(
      App.creates.create_company.operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.data?.createOneCompany?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findCompany {findUniqueCompany(where: {id: "${result.data.createOneCompany.id}"}){id, annualRecurringRevenue}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.findUniqueCompany.annualRecurringRevenue).toEqual(
      100000,
    );
  });
  test('should run with not required missing params', async () => {
    const bundle = getBundle({
      name: 'Company Name',
      address: 'Company Address',
      domainName: 'Company Domain Name',
      linkedinUrl: 'Test linkedinUrl',
      xUrl: 'Test xUrl',
      idealCustomerProfile: true,
      employees: 25,
    });
    const result = await appTester(
      App.creates.create_company.operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.data?.createOneCompany?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findCompany {findUniqueCompany(where: {id: "${result.data.createOneCompany.id}"}){id, annualRecurringRevenue}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.findUniqueCompany.annualRecurringRevenue).toEqual(
      null,
    );
  });
});

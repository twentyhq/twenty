import App from '../../index';
import getBundle from '../../utils/getBundle';
import { Bundle, createAppTester, tools, ZObject } from 'zapier-platform-core';
import requestDb from '../../utils/requestDb';
import { createRecordKey } from '../../creates/create_record';
const appTester = createAppTester(App);
tools.env.inject();

describe('creates.[createRecordKey]', () => {
  test('should run to create a Company Record', async () => {
    const bundle = getBundle({
      nameSingular: 'Company',
      name: 'Company Name',
      address: 'Company Address',
      domainName: 'Company Domain Name',
      linkedinLink: { url: '/linkedin_url', label: 'Test linkedinUrl' },
      xLink: { url: '/x_url', label: 'Test xUrl' },
      annualRecurringRevenue: {
        amountMicros: 100000000000,
        currencyCode: 'USD',
      },
      idealCustomerProfile: true,
      employees: 25,
    });
    const result = await appTester(
      App.creates[createRecordKey].operation.perform,
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
    expect(
      checkDbResult.data.company.annualRecurringRevenue.amountMicros,
    ).toEqual(100000000000);
  });
  test('should run to create a Person Record', async () => {
    const bundle = getBundle({
      nameSingular: 'Person',
      name: { firstName: 'John', lastName: 'Doe' },
      email: 'johndoe@gmail.com',
      phone: '+33610203040',
      city: 'Paris',
    });
    const result = await appTester(
      App.creates[createRecordKey].operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.data?.createPerson?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findPerson {person(filter: {id: {eq: "${result.data.createPerson.id}"}}){phone}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.person.phone).toEqual('+33610203040');
  });
});

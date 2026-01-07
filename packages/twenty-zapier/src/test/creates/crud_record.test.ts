import {
  type Bundle,
  createAppTester,
  tools,
  type ZObject,
} from 'zapier-platform-core';

import { crudRecordKey } from '../../creates/crud_record';
import App from '../../index';
import getBundle from '../../utils/getBundle';
import requestDb from '../../utils/requestDb';
import { DatabaseEventAction } from '../../utils/triggers/triggers.utils';
const appTester = createAppTester(App);
tools.env.inject();

describe('creates.create_company', () => {
  test('should run to create a Company Record', async () => {
    const bundle = getBundle({
      nameSingular: 'Company',
      crudZapierOperation: DatabaseEventAction.CREATED,
      name: 'Company Name',
      address: { addressCity: 'Paris' },
      linkedinLink: {
        primaryLinkUrl: 'http://test.com/linkedin_url',
        primaryLinkLabel: 'Test linkedinUrl',
        secondaryLinks: [
          '{ url: "http://test.com/linkedin_url2", label: "Test linkedinUrl2" }',
        ],
      },
      xLink: {
        primaryLinkUrl: 'http://test.com/x_url',
        primaryLinkLabel: 'Test xUrl',
        secondaryLinks: [
          '{ url: "http://test.com/x_url2", label: "Test xUrl2" }',
        ],
      },
      annualRecurringRevenue: {
        amountMicros: 100000000000,
        currencyCode: 'USD',
      },
      idealCustomerProfile: true,
      employees: 25,
    });
    const result = await appTester(
      App.creates[crudRecordKey].operation.perform,
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
      crudZapierOperation: DatabaseEventAction.CREATED,
      name: { firstName: 'John', lastName: 'Doe' },
      phones: {
        primaryPhoneNumber: '610203040',
        primaryPhoneCountryCode: 'FR',
        primaryPhoneCallingCode: '+33',
        additionalPhones: [
          '{number: "610203041", countryCode: "FR", callingCode: "+33"}',
        ],
      },
      city: 'Paris',
    });
    const result = await appTester(
      App.creates[crudRecordKey].operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.data?.createPerson?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findPerson {person(filter: {id: {eq: "${result.data.createPerson.id}"}}){phones{primaryPhoneNumber}}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.person.phones.primaryPhoneNumber).toEqual(
      '610203040',
    );
  });
});

describe('creates.update_company', () => {
  test('should run to update a Company record', async () => {
    const createBundle = getBundle({
      nameSingular: 'Company',
      crudZapierOperation: DatabaseEventAction.CREATED,
      name: 'Company Name',
      employees: 25,
    });

    const createResult = await appTester(
      App.creates[crudRecordKey].operation.perform,
      createBundle,
    );

    const companyId = createResult.data?.createCompany?.id;

    const updateBundle = getBundle({
      nameSingular: 'Company',
      crudZapierOperation: DatabaseEventAction.UPDATED,
      id: companyId,
      name: 'Updated Company Name',
    });

    const updateResult = await appTester(
      App.creates[crudRecordKey].operation.perform,
      updateBundle,
    );

    expect(updateResult).toBeDefined();
    expect(updateResult.data?.updateCompany?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findCompany {company(filter: {id: {eq: "${companyId}"}}){id name}}`,
        ),
      updateBundle,
    );
    expect(checkDbResult.data.company.name).toEqual('Updated Company Name');
  });
});

describe('creates.delete_company', () => {
  test('should run to delete a Company record', async () => {
    const createBundle = getBundle({
      nameSingular: 'Company',
      crudZapierOperation: DatabaseEventAction.CREATED,
      name: 'Delete Company Name',
      employees: 25,
    });

    const createResult = await appTester(
      App.creates[crudRecordKey].operation.perform,
      createBundle,
    );

    const companyId = createResult.data?.createCompany?.id;

    const deleteBundle = getBundle({
      nameSingular: 'Company',
      crudZapierOperation: DatabaseEventAction.DELETED,
      id: companyId,
    });

    const deleteResult = await appTester(
      App.creates[crudRecordKey].operation.perform,
      deleteBundle,
    );

    expect(deleteResult).toBeDefined();
    expect(deleteResult.data?.deleteCompany?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findCompanies {companies(filter: {id: {eq: "${companyId}"}}){edges{node{id}}}}`,
        ),
      deleteBundle,
    );
    expect(checkDbResult.data.companies.edges.length).toEqual(0);
  });
});

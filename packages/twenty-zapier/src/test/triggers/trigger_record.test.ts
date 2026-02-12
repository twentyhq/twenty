import {
  type Bundle,
  createAppTester,
  type ZObject,
} from 'zapier-platform-core';

import App from '../../index';
import { triggerRecordKey } from '../../triggers/trigger_record';
import getBundle from '../../utils/getBundle';
import requestDb from '../../utils/requestDb';
import { DatabaseEventAction } from '../../utils/triggers/triggers.utils';
const appTester = createAppTester(App);

describe('triggers.trigger_record.created', () => {
  test('should succeed to subscribe', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.CREATED;
    bundle.targetUrl = 'https://test.com';

    const result = await appTester(
      App.triggers[triggerRecordKey].operation.performSubscribe,
      bundle,
    );

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();

    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query webhook {webhook(input: {id: "${result.id}"}){id operations}}`,
        ),
      bundle,
    );

    expect(checkDbResult.data.webhook.operations[0]).toEqual('company.created');
  });

  test('should succeed to unsubscribe', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.CREATED;
    bundle.targetUrl = 'https://test.com';

    const result = await appTester(
      App.triggers[triggerRecordKey].operation.performSubscribe,
      bundle,
    );

    const unsubscribeBundle = getBundle({});

    unsubscribeBundle.subscribeData = { id: result.id };

    const unsubscribeResult = await appTester(
      App.triggers[triggerRecordKey].operation.performUnsubscribe,
      unsubscribeBundle,
    );

    expect(unsubscribeResult).toBeTruthy();

    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(z, bundle, `query webhook {webhooks {id}}`),
      bundle,
    );
    expect(
      // @ts-expect-error legacy noImplicitAny
      checkDbResult.data.webhooks.filter((webhook) => webhook.id === result.id)
        .length,
    ).toEqual(0);
  });

  test('should load company from webhook', async () => {
    const bundle = {
      cleanedRequest: {
        record: {
          id: 'd6ccb1d1-a90b-4822-a992-a0dd946592c9',
          name: '',
          domainName: '',
          createdAt: '2023-10-19 10:10:12.490',
          address: { addressCity: null },
          employees: null,
          linkedinUrl: null,
          xUrl: null,
          annualRecurringRevenue: null,
          idealCustomerProfile: false,
        },
      },
    };

    const results = await appTester(
      App.triggers[triggerRecordKey].operation.perform,
      bundle,
    );

    expect(results.length).toEqual(1);

    const company = results[0];

    expect(company.record.id).toEqual('d6ccb1d1-a90b-4822-a992-a0dd946592c9');
  });
  it('should load companies from list', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.CREATED;

    const results = await appTester(
      App.triggers[triggerRecordKey].operation.performList,
      bundle,
    );

    expect(results.length).toBeGreaterThan(1);

    const firstCompany = results[0];

    expect(firstCompany.record).toBeDefined();
  });
});

describe('triggers.trigger_record.update', () => {
  test('should succeed to subscribe', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.UPDATED;
    bundle.targetUrl = 'https://test.com';

    const result = await appTester(
      App.triggers[triggerRecordKey].operation.performSubscribe,
      bundle,
    );

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();

    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query webhook {webhook(input: {id: "${result.id}"}){id operations}}`,
        ),
      bundle,
    );

    expect(checkDbResult.data.webhook.operations[0]).toEqual('company.updated');
  });
  test('should succeed to unsubscribe', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.UPDATED;
    bundle.targetUrl = 'https://test.com';

    const result = await appTester(
      App.triggers[triggerRecordKey].operation.performSubscribe,
      bundle,
    );

    const unsubscribeBundle = getBundle({});

    unsubscribeBundle.subscribeData = { id: result.id };

    const unsubscribeResult = await appTester(
      App.triggers[triggerRecordKey].operation.performUnsubscribe,
      unsubscribeBundle,
    );

    expect(unsubscribeResult).toBeTruthy();

    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(z, bundle, `query webhook {webhooks {id}}`),
      bundle,
    );
    expect(
      // @ts-expect-error legacy noImplicitAny
      checkDbResult.data.webhooks.filter((webhook) => webhook.id === result.id)
        .length,
    ).toEqual(0);
  });
  it('should load companies from list', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.UPDATED;

    const results = await appTester(
      App.triggers[triggerRecordKey].operation.performList,
      bundle,
    );

    expect(results.length).toBeGreaterThan(1);

    const firstCompany = results[0];

    expect(firstCompany.record).toBeDefined();
    expect(firstCompany.updatedFields).toBeDefined();
  });
});

describe('triggers.trigger_record.delete', () => {
  test('should succeed to subscribe', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.DELETED;
    bundle.targetUrl = 'https://test.com';

    const result = await appTester(
      App.triggers[triggerRecordKey].operation.performSubscribe,
      bundle,
    );

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();

    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query webhook {webhook(input: {id: "${result.id}"}){id operations}}`,
        ),
      bundle,
    );

    expect(checkDbResult.data.webhook.operations[0]).toEqual('company.deleted');
  });
  test('should succeed to unsubscribe', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.DELETED;
    bundle.targetUrl = 'https://test.com';

    const result = await appTester(
      App.triggers[triggerRecordKey].operation.performSubscribe,
      bundle,
    );

    const unsubscribeBundle = getBundle({});

    unsubscribeBundle.subscribeData = { id: result.id };

    const unsubscribeResult = await appTester(
      App.triggers[triggerRecordKey].operation.performUnsubscribe,
      unsubscribeBundle,
    );

    expect(unsubscribeResult).toBeTruthy();

    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(z, bundle, `query webhook {webhooks {id}}`),
      bundle,
    );
    expect(
      // @ts-expect-error legacy noImplicitAny
      checkDbResult.data.webhooks.filter((webhook) => webhook.id === result.id)
        .length,
    ).toEqual(0);
  });
  it('should load companies from list', async () => {
    const bundle = getBundle({});

    bundle.inputData.nameSingular = 'company';
    bundle.inputData.operation = DatabaseEventAction.DELETED;

    const results = await appTester(
      App.triggers[triggerRecordKey].operation.performList,
      bundle,
    );

    expect(results.length).toBeGreaterThan(1);

    const firstCompany = results[0];

    expect(firstCompany).toBeDefined();
    expect(firstCompany.record.id).toBeDefined();
    expect(Object.keys(firstCompany).length).toEqual(1);
  });
});

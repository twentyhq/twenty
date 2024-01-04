import { Bundle, createAppTester, ZObject } from 'zapier-platform-core';
import App from '../../index';
import getBundle from '../../utils/getBundle';
import requestDb from '../../utils/requestDb';
import { triggerRecordUpdatedKey } from '../../triggers/trigger_record_updated';
const appTester = createAppTester(App);

describe('triggers.trigger_record_updated', () => {
  test('should succeed to subscribe', async () => {
    const bundle = getBundle({});
    bundle.inputData.namePlural = 'companies';
    bundle.targetUrl = 'https://test.com';
    const result = await appTester(
      App.triggers[triggerRecordUpdatedKey].operation.performSubscribe,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query webhook {webhooks(filter: {id: {eq: "${result.id}"}}){edges {node {id operation}}}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.webhooks.edges[0].node.operation).toEqual(
      'update.companies',
    );
  });
  test('should succeed to unsubscribe', async () => {
    const bundle = getBundle({});
    bundle.inputData.namePlural = 'companies';
    bundle.targetUrl = 'https://test.com';
    const result = await appTester(
      App.triggers[triggerRecordUpdatedKey].operation.performSubscribe,
      bundle,
    );
    const unsubscribeBundle = getBundle({});
    unsubscribeBundle.subscribeData = { id: result.id };
    const unsubscribeResult = await appTester(
      App.triggers[triggerRecordUpdatedKey].operation.performUnsubscribe,
      unsubscribeBundle,
    );
    expect(unsubscribeResult).toBeDefined();
    expect(unsubscribeResult.id).toEqual(result.id);
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query webhook {webhooks(filter: {id: {eq: "${result.id}"}}){edges {node {id operation}}}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.webhooks.edges.length).toEqual(0);
  });
  test('should load company from webhook', async () => {
    const bundle = {
      cleanedRequest: {
        id: 'd6ccb1d1-a90b-4822-a992-a0dd946592c9',
        name: '',
        domainName: '',
        createdAt: '2023-10-19 10:10:12.490',
        address: '',
        employees: null,
        linkedinUrl: null,
        xUrl: null,
        annualRecurringRevenue: null,
        idealCustomerProfile: false,
      },
    };
    const results = await appTester(
      App.triggers[triggerRecordUpdatedKey].operation.perform,
      bundle,
    );
    expect(results.length).toEqual(1);
    const company = results[0];
    expect(company.id).toEqual('d6ccb1d1-a90b-4822-a992-a0dd946592c9');
  });
  it('should load companies from list', async () => {
    const bundle = getBundle({});
    bundle.inputData.namePlural = 'companies';
    const results = await appTester(
      App.triggers[triggerRecordUpdatedKey].operation.performList,
      bundle,
    );
    expect(results.length).toBeGreaterThan(1);
    const firstCompany = results[0];
    expect(firstCompany).toBeDefined();
  });
});

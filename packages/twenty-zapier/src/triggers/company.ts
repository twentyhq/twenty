import { Bundle, ZObject } from 'zapier-platform-core';
import requestDb from '../utils/requestDb';
import handleQueryParams from '../utils/handleQueryParams';

const performSubscribe = async (z: ZObject, bundle: Bundle) => {
  const data = { targetUrl: bundle.targetUrl, operation: 'company' };
  const result = await requestDb(
    z,
    bundle,
    `mutation createWebhook {createWebhook(data:{${handleQueryParams(
      data,
    )}}) {id}}`,
  );
  return result.data.createWebhook;
};
const performUnsubscribe = async (z: ZObject, bundle: Bundle) => {
  const data = { id: bundle.subscribeData?.id };
  const result = await requestDb(
    z,
    bundle,
    `mutation deleteWebhook {deleteWebhook(${handleQueryParams(
      data,
    )}) {id}}`,
  );
  return result.data.deleteWebhook;
};
const perform = (z: ZObject, bundle: Bundle) => {
  return [bundle.cleanedRequest];
};
const performList = async (z: ZObject, bundle: Bundle) => {
  const results = await requestDb(
    z,
    bundle,
    `query company {companies {edges {node {
      id
      name
      domainName
      createdAt
      address
      employees
      linkedinLink{label url}
      xLink{label url}
      annualRecurringRevenue{amountMicros currencyCode}
      idealCustomerProfile
    }}}}`,
  );
  return results.data.companies.edges;
};
export default {
  key: 'company',
  noun: 'Company',
  display: {
    label: 'New Company',
    description: 'Triggers when a new company is created.',
  },
  operation: {
    inputFields: [],
    type: 'hook',
    performSubscribe,
    performUnsubscribe,
    perform,
    performList,
    sample: {
      id: 'f75f6b2e-9442-4c72-aa95-47d8e5ec8cb3',
      createdAt: '2023-10-19T07:37:25.306Z',
      workspaceId: 'c8b070fc-c969-4ca5-837a-e7c3735734d2',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'workspaceId', label: 'Workspace ID' },
    ],
  },
};

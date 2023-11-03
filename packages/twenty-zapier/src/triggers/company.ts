import { Bundle, ZObject } from 'zapier-platform-core';
import requestDb from '../utils/requestDb';
import handleQueryParams from '../utils/handleQueryParams';

const performSubscribe = async (z: ZObject, bundle: Bundle) => {
  const data = { targetUrl: bundle.targetUrl, operation: 'createOneCompany' };
  const result = await requestDb(
    z,
    bundle,
    `mutation createOneWebHook {createOneWebHook(data:{${handleQueryParams(
      data,
    )}}) {id}}`,
  );
  return result.data.createOneWebHook;
};
const performUnsubscribe = async (z: ZObject, bundle: Bundle) => {
  const data = { id: bundle.subscribeData?.id };
  const result = await requestDb(
    z,
    bundle,
    `mutation deleteOneWebHook {deleteOneWebHook(where:{${handleQueryParams(
      data,
    )}}) {id}}`,
  );
  return result.data.deleteOneWebHook;
};
const perform = (z: ZObject, bundle: Bundle) => {
  return [bundle.cleanedRequest];
};
const performList = async (z: ZObject, bundle: Bundle) => {
  const results = await requestDb(
    z,
    bundle,
    `query FindManyCompany {findManyCompany {
      id
      name
      domainName
      createdAt
      address
      employees
      linkedinUrl
      xUrl
      annualRecurringRevenue
      idealCustomerProfile
    }}`,
  );
  return results.data.findManyCompany;
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
    type: 'web-hook',
    performSubscribe,
    performUnsubscribe,
    perform,
    performList,
    sample: {
      id: 'f75f6b2e-9442-4c72-aa95-47d8e5ec8cb3',
      createdAt: '2023-10-19 07:37:25.306',
      workspaceId: 'c8b070fc-c969-4ca5-837a-e7c3735734d2',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'workspaceId', label: 'Workspace ID' },
    ],
  },
};

import {Bundle, ZObject} from "zapier-platform-core";
import requestDb from "../utils/requestDb";
import handleQueryParams from "../utils/handleQueryParams";

const performSubscribe = (z: ZObject, bundle: Bundle) => {
  const data = {targetUrl: bundle.targetUrl};
  return requestDb(
    z,
    bundle,
    `mutate createOneHook {createOneHook(data:{${handleQueryParams(data)}}) {id}}`,
  );
}
const performUnsubscribe = (z: ZObject, bundle: Bundle) => {
  const data = {hookId: bundle.subscribeData?.id};
  return requestDb(
    z,
    bundle,
    `mutate deleteOneHook {deleteOneHook(data:{${handleQueryParams(data)}}) {id}}`,
  );
}
const perform = (z: ZObject, bundle: Bundle) => {
  return [bundle.cleanedRequest];
}
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
}
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
      createdAt: '2023-10-19 07:37:25.306',
      workspaceId: 'c8b070fc-c969-4ca5-837a-e7c3735734d2',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'workspaceId', label: 'Workspace ID' },
    ],
  }
}

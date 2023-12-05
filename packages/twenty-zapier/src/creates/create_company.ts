import { Bundle, ZObject } from 'zapier-platform-core';
import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';

const perform = async (z: ZObject, bundle: Bundle) => {
  const query = `
  mutation createCompany {
    createCompany(
      data:{${handleQueryParams(bundle.inputData)}}
    )
    {id}
  }`;
  return await requestDb(z, bundle, query);
};
export default {
  display: {
    description: 'Creates a new Company in Twenty',
    hidden: false,
    label: 'Create New Company',
  },
  key: 'create_company',
  noun: 'Company',
  operation: {
    inputFields: [
      {
        key: 'name',
        label: 'Company Name',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'address',
        label: 'Address',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'domainName',
        label: 'Url',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'linkedinLink__url',
        label: 'Linkedin Link Url',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'linkedinLink__label',
        label: 'Linkedin Link Label',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'xLink__url',
        label: 'Twitter Link Url',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'xLink__label',
        label: 'Twitter Link Label',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'annualRecurringRevenue__amountMicros',
        label: 'ARR (Annual Recurring Revenue) amount micros',
        type: 'number',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'annualRecurringRevenue__currencyCode',
        label: 'ARR (Annual Recurring Revenue) currency Code',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'idealCustomerProfile',
        label: 'ICP (Ideal Customer Profile)',
        type: 'boolean',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'employees',
        label: 'Number of Employees',
        type: 'number',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
    ],
    sample: {
      name: 'Apple',
      address: 'apple.com',
      domainName: 'Cupertino',
      linkedinUrl__url: '/apple',
      linkedinUrl__label: 'Apple',
      xUrl__url: '/apple',
      xUrl__label: 'Apple',
      annualRecurringRevenue__amountMicros: 1000000000,
      annualRecurringRevenue__currencyCode: 'USD',
      idealCustomerProfile: true,
      employees: 10000,
    },
    perform,
  },
};

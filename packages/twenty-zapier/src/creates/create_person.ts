import { Bundle, ZObject } from 'zapier-platform-core';
import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';

const perform = async (z: ZObject, bundle: Bundle) => {
  const query = `
  mutation createPerson {
    createPerson(
      data:{${handleQueryParams(bundle.inputData)}}
    )
    {id}
  }`;
  return await requestDb(z, bundle, query);
};
export default {
  display: {
    description: 'Creates a new Person in Twenty',
    hidden: false,
    label: 'Create New Person',
  },
  key: 'create_person',
  noun: 'Person',
  operation: {
    inputFields: [
      {
        key: 'name__firstName',
        label: 'First Name',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'name__lastName',
        label: 'Last Name',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'email',
        label: 'Email',
        type: 'string',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'city',
        label: 'City',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
    ],
    sample: {
      name__firstName: 'John',
      name__lastName: 'Doe',
      email: 'johndoe@gmail.com',
    },
    perform,
  },
};

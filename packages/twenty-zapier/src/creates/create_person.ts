import { Bundle, ZObject } from 'zapier-platform-core';
import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';

const perform = async (z: ZObject, bundle: Bundle) => {
  const query = `
  mutation CreatePerson {
    createOnePerson(
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
        key: 'firstName',
        label: 'First Name',
        type: 'string',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'lastName',
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
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@gmail.com',
    },
    perform,
  },
};

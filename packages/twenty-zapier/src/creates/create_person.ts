import { Bundle, ZObject } from 'zapier-platform-core';

const perform = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    body: {
      query: `mutation 
          CreatePerson {
          createOnePerson(data:{
          firstName: "${bundle.inputData.firstName}", 
          lastName: "${bundle.inputData.lastName}", 
          email: "${bundle.inputData.email}", 
          phone: "${bundle.inputData.phone}", 
          city: "${bundle.inputData.city}"
          }){id}}`,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
    method: 'POST',
    url: `${process.env.SERVER_BASE_URL}/graphql`,
  });
  return response.json;
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

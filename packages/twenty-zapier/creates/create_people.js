module.exports = {
  display: {
    description: 'Creates a People in Twenty',
    hidden: false,
    label: 'Create People',
  },
  key: 'create_people',
  noun: 'People',
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
        required: true,
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
        key: 'company',
        label: 'Company',
        type: 'string',
        helpText: 'Company of the new Person',
        required: false,
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
    perform: {
      body: {
        query:
          'mutation CreatePerson {createOnePerson(data:{firstName: "{{bundle.inputData.firstName}}", lastName: "{{bundle.inputData.lastName}}", email: "{{bundle.inputData.email}}"}){id}}',
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer {{bundle.authData.api_key}}',
      },
      method: 'POST',
      url: `${process.env.SERVER_BASE_URL}/graphql`,
    },
  },
};

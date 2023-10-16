const test = async (z, bundle) => {
  const options = {
    url: `${process.env.SERVER_BASE_URL}/graphql`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bundle.authData.api_key}`,
    },
    body: {
      query: 'query currentWorkspace {currentWorkspace {id}}',
    },
  };

  return z.request(options).then((response) => {
    const results = response.json;
    if (results.errors) {
      throw new z.errors.Error(
        // This message is surfaced to the user
        'The API Key you supplied is incorrect',
        'AuthenticationError',
        results.errors
      );
    }
    response.throwForStatus();
    return results;
  }).catch(err => {
    throw new z.errors.Error(
      // This message is surfaced to the user
      'The API Key you supplied is incorrect',
      'AuthenticationError',
      err.message
    );
  });
};

const generateKey = async (z, bundle) => {
  const options = {
    url: `${process.env.SERVER_BASE_URL}/graphql`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bundle.authData.api_key}`,
    },
    body: {
      query: `mutation createApiKey {createOneApiKey(data:{name:"${bundle.apiKeyData.name}", expiresAt: "${bundle.apiKeyData.expiresAt}"}) {token}}`,
    },
  };
  return z.request(options).then((response) => {
    return response.token
  })
}

module.exports = {
  type: 'custom',
  test,
  generateKey,
  fields: [
    {
      computed: false,
      key: 'api_key',
      required: true,
      label: 'Api Key',
      type: 'string',
      helpText: 'Create the api key in your twenty workspace',
    },
  ],
  customConfig: {},
};

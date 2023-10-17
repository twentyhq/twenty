const test = async (z, bundle) => {
  const options = {
    url: `${process.env.SERVER_BASE_URL}/graphql`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
    body: {
      query: 'query currentWorkspace {currentWorkspace {id displayName}}',
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

module.exports = {
  type: 'custom',
  test,
  fields: [
    {
      computed: false,
      key: 'apiKey',
      required: true,
      label: 'Api Key',
      type: 'string',
      helpText: 'Create the api key in [your twenty workspace](https://app.twenty.com/settings/apis)',
    },
  ],
  connectionLabel: '{{data.currentWorkspace.displayName}}',
  customConfig: {},
};

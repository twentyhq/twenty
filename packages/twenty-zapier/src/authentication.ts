import { Bundle, HttpRequestOptions, ZObject } from 'zapier-platform-core';

const testAuthentication = async (z: ZObject, bundle: Bundle) => {
  const options = {
    url: `${process.env.SERVER_BASE_URL}/graphql`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
    body: {
      query: 'query currentWorkspace {currentWorkspace {id displayName}}',
    },
  } satisfies HttpRequestOptions;

  return z
    .request(options)
    .then((response) => {
      const results = response.json;
      if (results.errors) {
        throw new z.errors.Error(
          'The API Key you supplied is incorrect',
          'AuthenticationError',
          results.errors,
        );
      }
      response.throwForStatus();
      return results;
    })
    .catch((err) => {
      throw new z.errors.Error(
        'The API Key you supplied is incorrect',
        'AuthenticationError',
        err.message,
      );
    });
};

export default {
  type: 'custom',
  test: testAuthentication,
  fields: [
    {
      computed: false,
      key: 'apiKey',
      required: true,
      label: 'Api Key',
      type: 'string',
      helpText:
        'Create the api key in [your twenty workspace](https://app.twenty.com/settings/apis)',
    },
  ],
  connectionLabel: '{{data.currentWorkspace.displayName}}',
  customConfig: {},
};

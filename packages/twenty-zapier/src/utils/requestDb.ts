import { Bundle, HttpRequestOptions, ZObject } from 'zapier-platform-core';

const requestDb = async (z: ZObject, bundle: Bundle, query: string) => {
  const options = {
    url: `${process.env.SERVER_BASE_URL}/graphql`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
    body: {
      query,
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

export default requestDb;

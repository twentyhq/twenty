import { Bundle, HttpRequestOptions, ZObject } from 'zapier-platform-core';
export const getBundle = (inputData?: object) => {
  return {
    authData: { apiKey: String(process.env.API_KEY) },
    inputData,
  };
};
export const handleQueryParams = (inputData: { [x: string]: any }): string => {
  let result = '';
  Object.keys(inputData).forEach((key) => {
    let quote = '';
    if (typeof inputData[key] === 'string') quote = '"';
    result = result.concat(`${key}: ${quote}${inputData[key]}${quote}, `);
  });
  if (result.length) result = result.slice(0, -2); // Remove the last ', '
  return result;
};

export const requestDb = async (z: ZObject, bundle: Bundle, query: string) => {
  const options = {
    url: `${process.env.SERVER_BASE_URL}/graphql`,
    method: 'POST',
    headers: {
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

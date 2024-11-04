import { Bundle, HttpRequestOptions, ZObject } from 'zapier-platform-core';

import { Schema } from '../utils/data.types';

export const requestSchema = async (
  z: ZObject,
  bundle: Bundle,
): Promise<Schema> => {
  const query = `query GetObjects {
    objects(paging: {first: 1000}, filter: {isActive: {is:true}}) {
      edges {
        node {
          nameSingular
          namePlural
          labelSingular
          fields(paging: {first: 1000}, filter: {isActive: {is:true}}) {
            edges {
              node {
                type
                name
                label
                description
                isNullable
                defaultValue
              }
            }
          }
        }
      }
    }
  }`;
  const endpoint = 'metadata';
  return await requestDb(z, bundle, query, endpoint);
};

const requestDb = async (
  z: ZObject,
  bundle: Bundle,
  query: string,
  endpoint = 'graphql',
) => {
  const options = {
    url: `${bundle.authData.apiUrl || process.env.SERVER_BASE_URL}/${endpoint}`,
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
          `query: ${query}, error: ${JSON.stringify(results.errors)}`,
          'ApiError',
          response.status,
        );
      }
      response.throwForStatus();
      return results;
    })
    .catch((err) => {
      throw new z.errors.Error(
        `query: ${query}, error: ${err.message}`,
        'Error',
        err.status,
      );
    });
};

export const requestDbViaRestApi = (
  z: ZObject,
  bundle: Bundle,
  objectNamePlural: string,
): Promise<Record<string, any>[]> => {
  const options = {
    url: `${
      bundle.authData.apiUrl || process.env.SERVER_BASE_URL
    }/rest/${objectNamePlural}?limit:3`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
  } satisfies HttpRequestOptions;

  return z
    .request(options)
    .then((response) => response.json.data[objectNamePlural])
    .catch((err) => {
      throw new z.errors.Error(`Error: ${err.message}`, 'Error', err.status);
    });
};

export default requestDb;

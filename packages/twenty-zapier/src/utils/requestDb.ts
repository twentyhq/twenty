import type { Bundle, HttpRequestOptions, ZObject } from 'zapier-platform-core';

import { type Schema } from 'src/utils/data.types';

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
          fieldsList {
            type
            name
            label
            description
            isActive
            isNullable
            defaultValue
            options
          }
        }
      }
    }
  }`;

  const schema: Schema = await requestDb({
    z,
    bundle,
    query,
    endpoint: 'metadata',
  });

  // fieldsList returns every field, so filter to active ones to preserve the
  // behavior of the previous isActive-filtered fields cursor connection.
  return {
    ...schema,
    data: {
      ...schema.data,
      objects: {
        ...schema.data.objects,
        edges: schema.data.objects.edges.map((edge) => ({
          node: {
            ...edge.node,
            fieldsList: edge.node.fieldsList.filter((field) => field.isActive),
          },
        })),
      },
    },
  };
};

const requestDb = async ({
  z,
  bundle,
  query,
  endpoint = 'graphql',
}: {
  z: ZObject;
  bundle: Bundle;
  query: string;
  endpoint?: string;
}) => {
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

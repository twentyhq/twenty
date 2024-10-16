import { ASTNode, print } from 'graphql';
import gql from 'graphql-tag';
import pluralize from 'pluralize';
import request from 'supertest';

type QueryData = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

type StandardObjectsSingularName = 'Company' | 'Person';

export const makeGraphqlAPIRequest = (data: QueryData) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/graphql')
    .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
    .send({ query: print(data.query), variables: data.variables || {} });
};

export const expectSuccessfullGraphqlAPIRequest = (data: QueryData) => {
  return makeGraphqlAPIRequest(data).expect((res) => {
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data).toBeDefined();
  });
};

export const createOneObject = async (
  ObjectSingularName: StandardObjectsSingularName,
  data: object,
) => {
  const mutationName = `create${ObjectSingularName}`;

  const query = gql`
    mutation Create${ObjectSingularName}($data: ${ObjectSingularName}CreateInput) {
      ${mutationName}(data: $data) {
        id
      }
    }
  `;

  const variables = {
    data,
  };

  return await expectSuccessfullGraphqlAPIRequest({ query, variables }).then(
    (res) => {
      const createdObject = res.body.data[mutationName];

      return createdObject.id as string;
    },
  );
};

export const createManyObjects = async (
  ObjectSingularName: StandardObjectsSingularName,
  data: object[],
) => {
  const objectPluralName = pluralize(ObjectSingularName);
  const mutationName = `create${objectPluralName}`;

  const query = gql`
    mutation Create${objectPluralName}($data: [${ObjectSingularName}CreateInput!]) {
      ${mutationName}(data: $data) {
        id
      }
    }
  `;

  const variables = {
    data,
  };

  return await expectSuccessfullGraphqlAPIRequest({ query, variables }).then(
    (res) => {
      const createdObjectsIds: string[] = res.body.data[mutationName].map(
        (object) => object.id,
      );

      return createdObjectsIds;
    },
  );
};

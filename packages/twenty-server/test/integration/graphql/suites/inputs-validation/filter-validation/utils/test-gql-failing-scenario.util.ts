import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';

export const testGqlFailingScenario = async (
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  filter: any,
) => {
  const graphqlOperation = findManyOperationFactory({
    objectMetadataSingularName: objectMetadataSingularName,
    objectMetadataPluralName: objectMetadataPluralName,
    gqlFields: 'id',
    filter,
  });

  const response = await makeGraphqlApiRequestWithApiKey(graphqlOperation);

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors[0].message).toMatchSnapshot();
};

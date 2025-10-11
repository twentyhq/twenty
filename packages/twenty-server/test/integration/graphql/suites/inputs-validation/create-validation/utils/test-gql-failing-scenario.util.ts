import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';

export const testGqlFailingScenario = async (
  objectMetadataSingularName: string,
  input: any,
  errorMessage: string,
) => {
  const createManyGraphqlOperation = createOneOperationFactory({
    objectMetadataSingularName: objectMetadataSingularName,
    gqlFields: 'id',
    data: input,
  });

  const createManyResponse = await makeGraphqlAPIRequestWithApiKey(
    createManyGraphqlOperation,
  );

  expect(createManyResponse.body.errors).toBeDefined();
  expect(createManyResponse.body.errors[0].message).toContain(errorMessage);
};

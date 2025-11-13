import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';

export const expectGqlCreateInputValidationError = async (
  objectMetadataSingularName: string,
  input: any,
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
  expect(createManyResponse.body.errors[0].message).toMatchSnapshot();
};

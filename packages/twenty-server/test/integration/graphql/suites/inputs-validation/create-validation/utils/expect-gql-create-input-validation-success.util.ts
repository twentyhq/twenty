import { TEST_OBJECT_GQL_FIELDS } from 'test/integration/graphql/suites/inputs-validation/constants/test-object-gql-fields.constant';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';

import { pascalCase } from 'src/utils/pascal-case';

export const expectGqlCreateInputValidationSuccess = async (
  objectMetadataSingularName: string,
  input: any,
  validateInput: (record: Record<string, any>) => boolean,
) => {
  const createOneOperation = createOneOperationFactory({
    objectMetadataSingularName: objectMetadataSingularName,
    gqlFields: TEST_OBJECT_GQL_FIELDS,
    data: input,
  });

  const createOneResponse =
    await makeGraphqlAPIRequestWithApiKey(createOneOperation);

  expect(createOneResponse.body.errors).toBeUndefined();
  expect(createOneResponse.body.data).toBeDefined();
  expect(
    validateInput(
      createOneResponse.body.data[
        `create${pascalCase(objectMetadataSingularName)}`
      ],
    ),
  ).toBe(true);
};

import { TEST_OBJECT_GQL_FIELDS } from 'test/integration/graphql/suites/inputs-validation/constants/test-object-gql-fields.constant';
import { expectCreateInputValidationSuccessWithRetry } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/expect-create-input-validation-success-with-retry.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { isDefined, pascalCase } from 'twenty-shared/utils';

export const expectGqlCreateInputValidationSuccess = async (
  objectMetadataSingularName: string,
  input: any,
  validateInput: (record: Record<string, any>) => boolean,
  withFilesField: boolean = false,
) => {
  const createOneOperation = createOneOperationFactory({
    objectMetadataSingularName: objectMetadataSingularName,
    gqlFields:
      TEST_OBJECT_GQL_FIELDS +
      (withFilesField
        ? ` filesField {
      fileId
      label
  }`
        : ''),
    data: input,
  });

  await expectCreateInputValidationSuccessWithRetry({
    performCreate: async () => {
      const createOneResponse =
        await makeGraphqlAPIRequestWithApiKey(createOneOperation);

      return {
        hasError: isDefined(createOneResponse.body.errors),
        record:
          createOneResponse.body.data?.[
            `create${pascalCase(objectMetadataSingularName)}`
          ],
      };
    },
    validateInput,
  });
};

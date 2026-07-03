import { expectCreateInputValidationSuccessWithRetry } from 'test/integration/graphql/suites/inputs-validation/create-validation/utils/expect-create-input-validation-success-with-retry.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { isDefined, pascalCase } from 'twenty-shared/utils';

export const expectRestCreateInputValidationSuccess = async (
  objectMetadataPluralName: string,
  objectMetadataSingularName: string,
  input: any,
  validateInput: (record: Record<string, any>) => boolean,
) => {
  await expectCreateInputValidationSuccessWithRetry({
    performCreate: async () => {
      const response = await makeRestAPIRequest({
        method: 'post',
        path: `/${objectMetadataPluralName}`,
        body: input,
      });

      return {
        hasError: isDefined(response.body.error),
        record:
          response.body.data?.[
            `create${pascalCase(objectMetadataSingularName)}`
          ],
      };
    },
    validateInput,
  });
};

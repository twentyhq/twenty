import {
  type AssignRoleToApiKeyInput,
  assignRoleToApiKeyQueryFactory,
} from 'test/integration/metadata/suites/developers/utils/assign-role-to-api-key-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const assignRoleToApiKey = async ({
  input,
  expectToFail = false,
  token,
}: {
  input: AssignRoleToApiKeyInput;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  assignRoleToApiKey: boolean;
}> => {
  const graphqlOperation = assignRoleToApiKeyQueryFactory({ input });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'API key role assignment should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'API key role assignment has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

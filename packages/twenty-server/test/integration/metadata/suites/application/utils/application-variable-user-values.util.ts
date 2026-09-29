import { applicationVariableUserValuesQueryFactory } from 'test/integration/metadata/suites/application/utils/application-variable-user-values-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type WorkspaceMemberApplicationVariablesDTO } from 'src/engine/core-modules/application/application-variable/dtos/workspace-member-application-variables.dto';

export const applicationVariableUserValues = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<Record<string, never>>): CommonResponseBody<{
  applicationVariableUserValues: WorkspaceMemberApplicationVariablesDTO[];
}> => {
  const graphqlOperation = applicationVariableUserValuesQueryFactory({
    input,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Listing application variable user values should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Listing application variable user values has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

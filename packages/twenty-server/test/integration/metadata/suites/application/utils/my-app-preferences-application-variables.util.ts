import {
  type MyAppPreferencesApplicationVariablesInput,
  myAppPreferencesApplicationVariablesQueryFactory,
} from 'test/integration/metadata/suites/application/utils/my-app-preferences-application-variables-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UserApplicationVariableValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/user-application-variable-value.dto';

export const myAppPreferencesApplicationVariables = async ({
  input,
  gqlFields,
  token,
  expectToFail = false,
}: PerformMetadataQueryParams<MyAppPreferencesApplicationVariablesInput>): CommonResponseBody<{
  myAppPreferencesApplicationVariables: UserApplicationVariableValueDTO[];
}> => {
  const response = await makeMetadataApiRequest(
    myAppPreferencesApplicationVariablesQueryFactory({ input, gqlFields }),
    token,
  );

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Reading personal application variables should have failed',
    });
  } else {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading personal application variables should have succeeded',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

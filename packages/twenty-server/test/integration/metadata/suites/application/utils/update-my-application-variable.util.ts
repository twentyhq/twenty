import {
  type UpdateMyApplicationVariableFactoryInput,
  updateMyApplicationVariableQueryFactory,
} from 'test/integration/metadata/suites/application/utils/update-my-application-variable-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const updateMyApplicationVariable = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<UpdateMyApplicationVariableFactoryInput>): CommonResponseBody<{
  updateMyApplicationVariable: boolean;
}> => {
  const graphqlOperation = updateMyApplicationVariableQueryFactory({ input });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Updating my application variable should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Updating my application variable has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

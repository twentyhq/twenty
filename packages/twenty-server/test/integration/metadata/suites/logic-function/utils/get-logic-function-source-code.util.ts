import {
  type GetLogicFunctionSourceCodeFactoryInput,
  getLogicFunctionSourceCodeQueryFactory,
} from 'test/integration/metadata/suites/logic-function/utils/get-logic-function-source-code-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const getLogicFunctionSourceCode = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<GetLogicFunctionSourceCodeFactoryInput>): CommonResponseBody<{
  getLogicFunctionSourceCode: string | null;
}> => {
  const graphqlOperation = getLogicFunctionSourceCodeQueryFactory({ input });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Getting logic function source code should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Getting logic function source code has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

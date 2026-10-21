import { findManyLogicFunctionsQueryFactory } from 'test/integration/metadata/suites/logic-function/utils/find-many-logic-functions-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';

export const findManyLogicFunctions = async ({
  gqlFields,
  expectToFail = false,
  token,
}: Partial<PerformMetadataQueryParams<undefined>>): CommonResponseBody<{
  findManyLogicFunctions: LogicFunctionDTO[];
}> => {
  const graphqlOperation = findManyLogicFunctionsQueryFactory({ gqlFields });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Finding logic functions should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Finding logic functions has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

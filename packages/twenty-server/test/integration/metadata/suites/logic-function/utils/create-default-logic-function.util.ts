import {
  type CreateDefaultLogicFunctionFactoryInput,
  createDefaultLogicFunctionQueryFactory,
} from 'test/integration/metadata/suites/logic-function/utils/create-default-logic-function-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';

export const createDefaultLogicFunction = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateDefaultLogicFunctionFactoryInput>): CommonResponseBody<{
  createDefaultLogicFunction: LogicFunctionDTO;
}> => {
  const graphqlOperation = createDefaultLogicFunctionQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Logic Function creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Logic Function creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

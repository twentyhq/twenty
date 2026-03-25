import {
  type ExecuteLogicFunctionFactoryInput,
  executeLogicFunctionQueryFactory,
} from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

export const executeLogicFunction = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: {
  input: ExecuteLogicFunctionFactoryInput;
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  executeOneLogicFunction: LogicFunctionExecutionResultDTO;
}> => {
  const graphqlOperation = executeLogicFunctionQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Logic Function execution should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Logic Function execution has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

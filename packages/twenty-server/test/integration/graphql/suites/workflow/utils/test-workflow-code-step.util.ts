import {
  type TestWorkflowCodeStepFactoryInput,
  testWorkflowCodeStepQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/test-workflow-code-step-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

export const testWorkflowCodeStep = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<TestWorkflowCodeStepFactoryInput>): CommonResponseBody<{
  testWorkflowCodeStep: LogicFunctionExecutionResultDTO | null;
}> => {
  const response = await makeGraphqlApiRequest(
    testWorkflowCodeStepQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Testing a workflow code step should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Testing a workflow code step has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

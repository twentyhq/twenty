import {
  type RunCoreWorkflowVersionFactoryInput,
  runCoreWorkflowVersionQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/run-core-workflow-version-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const runCoreWorkflowVersion = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<RunCoreWorkflowVersionFactoryInput>): CommonResponseBody<{
  runCoreWorkflowVersion: { workflowRunId: string } | null;
}> => {
  const response = await makeGraphqlApiRequest(
    runCoreWorkflowVersionQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Running a core workflow version should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Running a core workflow version has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

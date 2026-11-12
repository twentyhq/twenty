import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import gql from 'graphql-tag';

type TestMcpToolStepFactoryInput = {
  workflowVersionId: string;
  mcpServerId: string;
  toolName: string;
  toolArguments?: Record<string, unknown>;
  isDestructiveToolConfirmed?: boolean;
};

type TestMcpToolStepOutput = {
  success: boolean;
  result?: unknown;
  error?: string | null;
};

export const testMcpToolStep = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<TestMcpToolStepFactoryInput>): CommonResponseBody<{
  testMcpToolStep: TestMcpToolStepOutput | null;
}> => {
  const response = await makeGraphqlApiRequest(
    {
      query: gql`
        mutation TestMcpToolStep($input: TestMcpToolStepInput!) {
          testMcpToolStep(input: $input) {
            success
            result
            error
          }
        }
      `,
      variables: { input },
    },
    token,
  );

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Testing an MCP tool step should have failed but did not',
    });
  } else {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Testing an MCP tool step has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

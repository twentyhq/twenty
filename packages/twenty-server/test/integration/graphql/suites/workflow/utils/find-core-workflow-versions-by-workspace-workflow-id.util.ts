import {
  type FindCoreWorkflowVersionsByWorkspaceWorkflowIdFactoryInput,
  findCoreWorkflowVersionsByWorkspaceWorkflowIdQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-versions-by-workspace-workflow-id-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findCoreWorkflowVersionsByWorkspaceWorkflowId = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindCoreWorkflowVersionsByWorkspaceWorkflowIdFactoryInput>): CommonResponseBody<{
  coreWorkflowVersions: { id: string }[];
}> => {
  const response = await makeGraphqlApiRequest(
    findCoreWorkflowVersionsByWorkspaceWorkflowIdQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Listing core workflow versions by their workspace workflow id should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Listing core workflow versions by their workspace workflow id has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

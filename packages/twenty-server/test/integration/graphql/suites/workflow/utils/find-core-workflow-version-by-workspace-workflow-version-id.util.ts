import {
  type FindCoreWorkflowVersionByWorkspaceWorkflowVersionIdFactoryInput,
  findCoreWorkflowVersionByWorkspaceWorkflowVersionIdQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-version-by-workspace-workflow-version-id-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findCoreWorkflowVersionByWorkspaceWorkflowVersionId = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindCoreWorkflowVersionByWorkspaceWorkflowVersionIdFactoryInput>): CommonResponseBody<{
  coreWorkflowVersion: { id: string; steps: unknown[] | null } | null;
}> => {
  const response = await makeGraphqlApiRequest(
    findCoreWorkflowVersionByWorkspaceWorkflowVersionIdQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Reading a core workflow version by its workspace workflow version id should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading a core workflow version by its workspace workflow version id has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

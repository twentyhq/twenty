import {
  type UpdateCoreWorkflowVisibilityFactoryInput,
  updateCoreWorkflowVisibilityQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/update-core-workflow-visibility-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { type WorkflowVisibility } from 'twenty-shared/types';

export const updateCoreWorkflowVisibility = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<UpdateCoreWorkflowVisibilityFactoryInput>): CommonResponseBody<{
  updateCoreWorkflowVisibility: { id: string; visibility: WorkflowVisibility };
}> => {
  const response = await makeGraphqlApiRequest(
    updateCoreWorkflowVisibilityQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Updating a core workflow visibility should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Updating a core workflow visibility has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

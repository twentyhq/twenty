import {
  type FindCoreWorkflowsWithCurrentVersionsFactoryInput,
  findCoreWorkflowsWithCurrentVersionsQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/find-core-workflows-with-current-versions-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findCoreWorkflowsWithCurrentVersions = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindCoreWorkflowsWithCurrentVersionsFactoryInput>): CommonResponseBody<{
  coreWorkflowsWithCurrentVersions: { workflow: { id: string } }[];
}> => {
  const response = await makeGraphqlApiRequest(
    findCoreWorkflowsWithCurrentVersionsQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Reading core workflows with their current versions should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading core workflows with their current versions has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

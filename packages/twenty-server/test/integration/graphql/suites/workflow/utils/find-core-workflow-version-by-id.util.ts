import {
  type FindCoreWorkflowVersionByIdFactoryInput,
  findCoreWorkflowVersionByIdQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-version-by-id-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findCoreWorkflowVersionById = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindCoreWorkflowVersionByIdFactoryInput>): CommonResponseBody<{
  coreWorkflowVersionById: { id: string; steps: unknown[] | null } | null;
}> => {
  const response = await makeGraphqlApiRequest(
    findCoreWorkflowVersionByIdQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Reading a core workflow version by id should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading a core workflow version by id has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

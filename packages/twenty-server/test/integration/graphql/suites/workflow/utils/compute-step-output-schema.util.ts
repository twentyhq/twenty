import {
  type ComputeStepOutputSchemaFactoryInput,
  computeStepOutputSchemaQueryFactory,
} from 'test/integration/graphql/suites/workflow/utils/compute-step-output-schema-query-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const computeStepOutputSchema = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<ComputeStepOutputSchemaFactoryInput>): CommonResponseBody<{
  computeStepOutputSchema: Record<string, unknown>;
}> => {
  const response = await makeGraphqlApiRequest(
    computeStepOutputSchemaQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Computing a step output schema should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Computing a step output schema has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

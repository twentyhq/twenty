import {
  type RunMyApplicationHealthCheckFactoryInput,
  runMyApplicationHealthCheckQueryFactory,
} from 'test/integration/metadata/suites/application/utils/run-my-application-health-check-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';

export const runMyApplicationHealthCheck = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<RunMyApplicationHealthCheckFactoryInput>): CommonResponseBody<{
  runMyApplicationHealthCheck: ApplicationHealthCheckResultDTO | null;
}> => {
  const graphqlOperation = runMyApplicationHealthCheckQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Running my application health check should have failed but did not',
    });
  }

  if (!expectToFail) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Running my application health check has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

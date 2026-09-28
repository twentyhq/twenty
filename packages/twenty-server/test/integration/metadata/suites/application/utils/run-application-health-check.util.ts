import {
  type RunApplicationHealthCheckFactoryInput,
  runApplicationHealthCheckQueryFactory,
} from 'test/integration/metadata/suites/application/utils/run-application-health-check-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';

export const runApplicationHealthCheck = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<RunApplicationHealthCheckFactoryInput>): CommonResponseBody<{
  runApplicationHealthCheck: ApplicationHealthCheckResultDTO | null;
}> => {
  const graphqlOperation = runApplicationHealthCheckQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Running application health check should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Running application health check has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

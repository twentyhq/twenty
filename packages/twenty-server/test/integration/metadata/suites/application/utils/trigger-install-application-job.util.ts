import {
  type TriggerInstallApplicationJobFactoryInput,
  triggerInstallApplicationJobQueryFactory,
} from 'test/integration/metadata/suites/application/utils/trigger-install-application-job-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const triggerInstallApplicationJob = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<TriggerInstallApplicationJobFactoryInput>): CommonResponseBody<{
  triggerInstallApplicationJob: { jobId: string };
}> => {
  const graphqlOperation = triggerInstallApplicationJobQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Triggering the application install job should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Triggering the application install job has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

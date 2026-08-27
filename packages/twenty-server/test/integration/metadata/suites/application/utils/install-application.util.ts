import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  type InstallApplicationFactoryInput,
  installApplicationQueryFactory,
} from 'test/integration/metadata/suites/application/utils/install-application-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { drainApplicationJobs } from 'test/integration/metadata/suites/application/utils/drain-application-jobs.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { isDefined } from 'twenty-shared/utils';

export const installApplication = async ({
  input,
  expectToFail = false,
  token,
}: {
  input: InstallApplicationFactoryInput;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  installApplication: { id: string };
}> => {
  const graphqlOperation = installApplicationQueryFactory({ input });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  // The mutation only enqueues the install; drain the queue so callers
  // observe the completed (or rolled back) installation.
  if (!isDefined(response.body.errors)) {
    await drainApplicationJobs();
  }

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Install application should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Install application has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

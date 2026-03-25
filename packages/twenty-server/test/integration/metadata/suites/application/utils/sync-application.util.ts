import { type Manifest } from 'twenty-shared/application';
import { syncApplicationQueryFactory } from 'test/integration/metadata/suites/application/utils/sync-application-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

type WorkspaceMigration = {
  applicationUniversalIdentifier: string;
  actions: unknown[];
};

export const syncApplication = async ({
  manifest,
  expectToFail = false,
  token,
}: {
  manifest: Manifest;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  syncApplication: WorkspaceMigration;
}> => {
  const graphqlOperation = syncApplicationQueryFactory({
    manifest,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Sync application should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Sync application has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

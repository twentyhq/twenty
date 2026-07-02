import { type Manifest } from 'twenty-shared/application';
import { exportApplicationQueryFactory } from 'test/integration/metadata/suites/application/utils/export-application-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const exportApplication = async ({
  universalIdentifier,
  expectToFail = false,
  token,
}: {
  universalIdentifier: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  exportApplication: {
    applicationUniversalIdentifier: string;
    manifest: Manifest;
  };
}> => {
  const graphqlOperation = exportApplicationQueryFactory({
    universalIdentifier,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Export application should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Export application has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

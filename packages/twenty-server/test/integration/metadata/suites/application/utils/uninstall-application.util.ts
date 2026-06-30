import { uninstallApplicationQueryFactory } from 'test/integration/metadata/suites/application/utils/uninstall-application-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const uninstallApplication = async ({
  universalIdentifier,
  expectToFail = false,
  token,
}: {
  universalIdentifier: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  uninstallApplication: boolean;
}> => {
  const graphqlOperation = uninstallApplicationQueryFactory({
    universalIdentifier,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Uninstall application should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Uninstall application has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

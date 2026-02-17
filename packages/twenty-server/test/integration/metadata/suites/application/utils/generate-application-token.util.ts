import { generateApplicationTokenQueryFactory } from 'test/integration/metadata/suites/application/utils/generate-application-token-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationTokenPairDTO } from 'src/engine/core-modules/application/dtos/application-token-pair.dto';

export const generateApplicationToken = async ({
  applicationId,
  expectToFail = false,
  token,
}: {
  applicationId: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  generateApplicationToken: ApplicationTokenPairDTO;
}> => {
  const graphqlOperation = generateApplicationTokenQueryFactory({
    applicationId,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Generate application token should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Generate application token has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

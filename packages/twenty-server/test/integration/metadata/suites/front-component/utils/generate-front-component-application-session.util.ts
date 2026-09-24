import {
  type GenerateFrontComponentApplicationSessionFactoryInput,
  generateFrontComponentApplicationSessionQueryFactory,
} from 'test/integration/metadata/suites/front-component/utils/generate-front-component-application-session-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type FrontComponentApplicationSessionDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component-application-session.dto';

export const generateFrontComponentApplicationSession = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<GenerateFrontComponentApplicationSessionFactoryInput>): CommonResponseBody<{
  generateFrontComponentApplicationSession: FrontComponentApplicationSessionDTO;
}> => {
  const graphqlOperation = generateFrontComponentApplicationSessionQueryFactory(
    {
      input,
      gqlFields,
    },
  );

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Generating front component application session should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Generating front component application session has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

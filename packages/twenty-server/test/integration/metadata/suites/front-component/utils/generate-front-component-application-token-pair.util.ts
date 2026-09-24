import {
  type GenerateFrontComponentApplicationTokenPairFactoryInput,
  generateFrontComponentApplicationTokenPairQueryFactory,
} from 'test/integration/metadata/suites/front-component/utils/generate-front-component-application-token-pair-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';

export const generateFrontComponentApplicationTokenPair = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<GenerateFrontComponentApplicationTokenPairFactoryInput>): CommonResponseBody<{
  generateFrontComponentApplicationTokenPair: ApplicationTokenPairDTO;
}> => {
  const graphqlOperation =
    generateFrontComponentApplicationTokenPairQueryFactory({
      input,
      gqlFields,
    });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Generating front component application token pair should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Generating front component application token pair has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

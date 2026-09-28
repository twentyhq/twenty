import {
  type FindApplicationConnectionProvidersFactoryInput,
  findApplicationConnectionProvidersQueryFactory,
} from 'test/integration/metadata/suites/connection-provider/utils/find-application-connection-providers-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationConnectionProviderDTO } from 'src/engine/core-modules/application/connection-provider/dtos/application-connection-provider.dto';

export const findApplicationConnectionProviders = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindApplicationConnectionProvidersFactoryInput>): CommonResponseBody<{
  applicationConnectionProviders: ApplicationConnectionProviderDTO[];
}> => {
  const graphqlOperation = findApplicationConnectionProvidersQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Finding application connection providers should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Finding application connection providers has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

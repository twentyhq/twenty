import {
  type InstallMarketplaceAppFactoryInput,
  installMarketplaceAppQueryFactory,
} from 'test/integration/metadata/suites/application/utils/install-marketplace-app-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const installMarketplaceApp = async ({
  input,
  expectToFail = false,
  token,
}: {
  input: InstallMarketplaceAppFactoryInput;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  installMarketplaceApp: boolean;
}> => {
  const graphqlOperation = installMarketplaceAppQueryFactory({ input });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Install marketplace app should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Install marketplace app has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

import { getAiProvidersQueryFactory } from 'test/integration/graphql/suites/user-session/utils/get-ai-providers-query-factory.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const getAiProviders = async ({
  expectToFail = false,
  token,
}: Omit<PerformMetadataQueryParams<never>, 'input'>): CommonResponseBody<{
  getAiProviders: Record<string, unknown>;
}> => {
  const response = await makeAdminPanelApiRequest(
    getAiProvidersQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Reading the admin panel AI providers should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading the admin panel AI providers has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

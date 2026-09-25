import { isMaintenanceModeBannerDismissedQueryFactory } from 'test/integration/graphql/suites/user-session/utils/is-maintenance-mode-banner-dismissed-query-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const isMaintenanceModeBannerDismissed = async ({
  expectToFail = false,
  token,
}: Omit<PerformMetadataQueryParams<never>, 'input'>): CommonResponseBody<{
  isMaintenanceModeBannerDismissed: boolean;
}> => {
  const response = await makeGraphqlAPIRequest(
    isMaintenanceModeBannerDismissedQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Reading the maintenance mode banner state should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading the maintenance mode banner state has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

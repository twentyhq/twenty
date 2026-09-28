import { enterpriseSubscriptionStatusQueryFactory } from 'test/integration/graphql/suites/user-session/utils/enterprise-subscription-status-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const enterpriseSubscriptionStatus = async ({
  expectToFail = false,
  token,
}: Omit<PerformMetadataQueryParams<never>, 'input'>): CommonResponseBody<{
  enterpriseSubscriptionStatus: { status: string } | null;
}> => {
  const response = await makeMetadataApiRequest(
    enterpriseSubscriptionStatusQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Reading the enterprise subscription status should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading the enterprise subscription status has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

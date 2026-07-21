import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';

type GetOnboardingStatusUtilArgs = {
  accessToken: string;
  expectToFail?: boolean;
};

export const getOnboardingStatus = async ({
  accessToken,
  expectToFail,
}: GetOnboardingStatusUtilArgs): CommonResponseBody<{
  currentUser: { onboardingStatus: OnboardingStatus | null };
}> => {
  const query = gql`
    query CurrentUserOnboardingStatus {
      currentUser {
        onboardingStatus
      }
    }
  `;

  const response = await makeMetadataAPIRequest(
    {
      query,
      variables: {},
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Get onboarding status should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Get onboarding status has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

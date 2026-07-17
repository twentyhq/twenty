import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

type SkipSyncEmailOnboardingStepUtilArgs = {
  accessToken: string;
  expectToFail?: boolean;
};

export const skipSyncEmailOnboardingStep = async ({
  accessToken,
  expectToFail,
}: SkipSyncEmailOnboardingStepUtilArgs): CommonResponseBody<{
  skipSyncEmailOnboardingStep: { success: boolean };
}> => {
  const mutation = gql`
    mutation SkipSyncEmailOnboardingStep {
      skipSyncEmailOnboardingStep {
        success
      }
    }
  `;

  const response = await makeMetadataAPIRequest(
    {
      query: mutation,
      variables: {},
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Skip sync email onboarding step should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Skip sync email onboarding step has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

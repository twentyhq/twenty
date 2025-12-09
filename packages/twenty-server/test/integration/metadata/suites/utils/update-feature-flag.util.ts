import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const updateFeatureFlag = async ({
  featureFlag,
  value,
  workspaceId = SEED_APPLE_WORKSPACE_ID,
  expectToFail,
}: {
  featureFlag: FeatureFlagKey;
  value: boolean;
  workspaceId?: string;
  expectToFail: boolean;
}) => {
  const enablePermissionsQuery = updateFeatureFlagFactory(
    workspaceId,
    featureFlag,
    value,
  );

  const response = await makeGraphqlAPIRequest(enablePermissionsQuery);

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      errorMessage: 'Update feature flag should not have failed',
      response,
    });
  }

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      errorMessage: 'Update feature flag should have failed',
      response,
    });
  }
};

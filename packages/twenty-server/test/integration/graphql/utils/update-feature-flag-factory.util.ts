import gql from 'graphql-tag';

import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const updateFeatureFlagFactory = (
  workspaceId: string,
  featureFlag: FeatureFlagKey,
  value: boolean,
) => ({
  query: gql`
    mutation UpdateWorkspaceFeatureFlag(
      $workspaceId: UUID!
      $featureFlag: String!
      $value: Boolean!
    ) {
      updateWorkspaceFeatureFlag(
        workspaceId: $workspaceId
        featureFlag: $featureFlag
        value: $value
      )
    }
  `,
  variables: {
    workspaceId,
    featureFlag,
    value,
  },
});

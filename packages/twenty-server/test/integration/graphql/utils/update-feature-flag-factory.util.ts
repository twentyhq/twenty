import gql from 'graphql-tag';

export const updateFeatureFlagFactory = (
  workspaceId: string,
  featureFlag: string,
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

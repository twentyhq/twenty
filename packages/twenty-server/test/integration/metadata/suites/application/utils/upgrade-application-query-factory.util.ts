import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpgradeApplicationFactoryInput = {
  appRegistrationId: string;
  targetVersion: string;
  hasUserApprovedRoleGrants?: boolean;
};

export const upgradeApplicationQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpgradeApplicationFactoryInput>) => ({
  query: gql`
    mutation UpgradeApplication(
      $appRegistrationId: String!
      $targetVersion: String!
      $hasUserApprovedRoleGrants: Boolean
    ) {
      upgradeApplication(
        appRegistrationId: $appRegistrationId
        targetVersion: $targetVersion
        hasUserApprovedRoleGrants: $hasUserApprovedRoleGrants
      )
    }
  `,
  variables: {
    appRegistrationId: input.appRegistrationId,
    targetVersion: input.targetVersion,
    hasUserApprovedRoleGrants: input.hasUserApprovedRoleGrants,
  },
});

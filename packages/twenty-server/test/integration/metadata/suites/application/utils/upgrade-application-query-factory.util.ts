import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpgradeApplicationFactoryInput = {
  appRegistrationId: string;
  targetVersion: string;
};

export const upgradeApplicationQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpgradeApplicationFactoryInput>) => ({
  query: gql`
    mutation UpgradeApplication(
      $appRegistrationId: String!
      $targetVersion: String!
    ) {
      upgradeApplication(
        appRegistrationId: $appRegistrationId
        targetVersion: $targetVersion
      )
    }
  `,
  variables: {
    appRegistrationId: input.appRegistrationId,
    targetVersion: input.targetVersion,
  },
});

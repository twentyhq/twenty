import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TransferApplicationRegistrationOwnershipFactoryInput = {
  applicationRegistrationId: string;
  targetWorkspaceSubdomain: string;
};

const DEFAULT_TRANSFER_APPLICATION_REGISTRATION_OWNERSHIP_GQL_FIELDS = `
  id
  ownerWorkspaceId
`;

export const transferApplicationRegistrationOwnershipQueryFactory = ({
  input,
  gqlFields = DEFAULT_TRANSFER_APPLICATION_REGISTRATION_OWNERSHIP_GQL_FIELDS,
}: PerformMetadataQueryParams<TransferApplicationRegistrationOwnershipFactoryInput>) => ({
  query: gql`
    mutation TransferApplicationRegistrationOwnership(
      $applicationRegistrationId: String!
      $targetWorkspaceSubdomain: String!
    ) {
      transferApplicationRegistrationOwnership(
        applicationRegistrationId: $applicationRegistrationId
        targetWorkspaceSubdomain: $targetWorkspaceSubdomain
      ) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationRegistrationId: input.applicationRegistrationId,
    targetWorkspaceSubdomain: input.targetWorkspaceSubdomain,
  },
});

import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type ClaimApplicationRegistrationOwnershipFactoryInput = {
  applicationRegistrationId: string;
};

const DEFAULT_CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_GQL_FIELDS = `
  id
  ownerWorkspaceId
`;

export const claimApplicationRegistrationOwnershipQueryFactory = ({
  input,
  gqlFields = DEFAULT_CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_GQL_FIELDS,
}: PerformMetadataQueryParams<ClaimApplicationRegistrationOwnershipFactoryInput>) => ({
  query: gql`
    mutation ClaimApplicationRegistrationOwnership(
      $applicationRegistrationId: String!
    ) {
      claimApplicationRegistrationOwnership(
        applicationRegistrationId: $applicationRegistrationId
      ) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationRegistrationId: input.applicationRegistrationId,
  },
});

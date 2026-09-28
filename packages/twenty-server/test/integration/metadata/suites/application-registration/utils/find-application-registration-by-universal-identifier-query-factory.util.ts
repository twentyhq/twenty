import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindApplicationRegistrationByUniversalIdentifierFactoryInput = {
  universalIdentifier: string;
};

const DEFAULT_FIND_APPLICATION_REGISTRATION_BY_UNIVERSAL_IDENTIFIER_GQL_FIELDS = `
  id
  universalIdentifier
  name
  oAuthClientId
  oAuthRedirectUris
  ownerWorkspaceId
  sourcePackage
`;

export const findApplicationRegistrationByUniversalIdentifierQueryFactory = ({
  input,
  gqlFields = DEFAULT_FIND_APPLICATION_REGISTRATION_BY_UNIVERSAL_IDENTIFIER_GQL_FIELDS,
}: PerformMetadataQueryParams<FindApplicationRegistrationByUniversalIdentifierFactoryInput>) => ({
  query: gql`
    query FindApplicationRegistrationByUniversalIdentifier($universalIdentifier: String!) {
      findApplicationRegistrationByUniversalIdentifier(universalIdentifier: $universalIdentifier) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    universalIdentifier: input.universalIdentifier,
  },
});

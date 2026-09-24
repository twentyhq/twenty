import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type GenerateFrontComponentApplicationSessionFactoryInput = {
  applicationId: string;
};

const DEFAULT_FRONT_COMPONENT_APPLICATION_SESSION_GQL_FIELDS = `
  applicationTokenPair {
    applicationAccessToken {
      token
      expiresAt
    }
    applicationRefreshToken {
      token
      expiresAt
    }
  }
  applicationVariables
`;

export const generateFrontComponentApplicationSessionQueryFactory = ({
  input,
  gqlFields = DEFAULT_FRONT_COMPONENT_APPLICATION_SESSION_GQL_FIELDS,
}: PerformMetadataQueryParams<GenerateFrontComponentApplicationSessionFactoryInput>) => ({
  query: gql`
    mutation GenerateFrontComponentApplicationSession($applicationId: UUID!) {
      generateFrontComponentApplicationSession(applicationId: $applicationId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationId: input.applicationId,
  },
});

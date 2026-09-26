import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type GenerateFrontComponentApplicationTokenPairFactoryInput = {
  applicationId: string;
};

const DEFAULT_APPLICATION_TOKEN_PAIR_GQL_FIELDS = `
  applicationAccessToken {
    token
    expiresAt
  }
  applicationRefreshToken {
    token
    expiresAt
  }
`;

export const generateFrontComponentApplicationTokenPairQueryFactory = ({
  input,
  gqlFields = DEFAULT_APPLICATION_TOKEN_PAIR_GQL_FIELDS,
}: PerformMetadataQueryParams<GenerateFrontComponentApplicationTokenPairFactoryInput>) => ({
  query: gql`
    mutation GenerateFrontComponentApplicationTokenPair($applicationId: UUID!) {
      generateFrontComponentApplicationTokenPair(applicationId: $applicationId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationId: input.applicationId,
  },
});

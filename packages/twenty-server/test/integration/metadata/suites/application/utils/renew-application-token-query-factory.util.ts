import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type RenewApplicationTokenFactoryInput = {
  applicationRefreshToken: string;
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

export const renewApplicationTokenQueryFactory = ({
  input,
  gqlFields = DEFAULT_APPLICATION_TOKEN_PAIR_GQL_FIELDS,
}: PerformMetadataQueryParams<RenewApplicationTokenFactoryInput>) => ({
  query: gql`
    mutation RenewApplicationToken($applicationRefreshToken: String!) {
      renewApplicationToken(applicationRefreshToken: $applicationRefreshToken) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationRefreshToken: input.applicationRefreshToken,
  },
});

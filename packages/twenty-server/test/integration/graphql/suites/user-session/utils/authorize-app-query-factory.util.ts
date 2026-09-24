import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type AuthorizeAppFactoryInput = {
  clientId: string;
  redirectUrl: string;
  codeChallenge?: string;
};

export const authorizeAppQueryFactory = ({
  input,
}: PerformMetadataQueryParams<AuthorizeAppFactoryInput>) => ({
  query: gql`
    mutation AuthorizeApp(
      $clientId: String!
      $redirectUrl: String!
      $codeChallenge: String
    ) {
      authorizeApp(
        clientId: $clientId
        redirectUrl: $redirectUrl
        codeChallenge: $codeChallenge
      ) {
        redirectUrl
      }
    }
  `,
  variables: {
    clientId: input.clientId,
    redirectUrl: input.redirectUrl,
    codeChallenge: input.codeChallenge,
  },
});

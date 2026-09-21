import { gql } from 'graphql-tag';

export type GetAuthTokensFromLoginTokenFactoryInput = {
  loginToken: string;
  origin: string;
};

export const getAuthTokensFromLoginTokenQueryFactory = ({
  loginToken,
  origin,
}: GetAuthTokensFromLoginTokenFactoryInput) => {
  return {
    query: gql`
      mutation GetAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
        getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
          tokens {
            accessOrWorkspaceAgnosticToken {
              token
              expiresAt
            }
            refreshToken {
              token
              expiresAt
            }
          }
        }
      }
    `,
    variables: {
      loginToken,
      origin,
    },
  };
};

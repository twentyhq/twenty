import { gql } from 'graphql-tag';

export type GetLoginTokenFromCredentialsFactoryInput = {
  email: string;
  password: string;
  origin: string;
};

export const getLoginTokenFromCredentialsQueryFactory = ({
  email,
  password,
  origin,
}: GetLoginTokenFromCredentialsFactoryInput) => {
  return {
    query: gql`
      mutation GetLoginTokenFromCredentials(
        $email: String!
        $password: String!
        $origin: String!
      ) {
        getLoginTokenFromCredentials(
          email: $email
          password: $password
          origin: $origin
        ) {
          loginToken {
            token
          }
        }
      }
    `,
    variables: {
      email,
      password,
      origin,
    },
  };
};

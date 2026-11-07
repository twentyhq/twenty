import gql from 'graphql-tag';

export const verifyEmailAndGetLoginTokenOperationFactory = ({
  email,
  emailVerificationToken,
  origin,
}: {
  email: string;
  emailVerificationToken: string;
  origin: string;
}) => ({
  query: gql`
    mutation VerifyEmailAndGetLoginToken(
      $email: String!
      $emailVerificationToken: String!
      $origin: String!
    ) {
      verifyEmailAndGetLoginToken(
        email: $email
        emailVerificationToken: $emailVerificationToken
        origin: $origin
      ) {
        loginToken {
          token
        }
      }
    }
  `,
  variables: { email, emailVerificationToken, origin },
});

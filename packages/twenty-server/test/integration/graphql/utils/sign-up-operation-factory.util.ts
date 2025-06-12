import gql from 'graphql-tag';
import { SignUpInput } from 'src/engine/core-modules/auth/dto/sign-up.input';

// Should come from auto-generated shared package
const SignUpDocument = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $workspaceInviteHash: String
    $workspacePersonalInviteToken: String = null
    $captchaToken: String
    $workspaceId: String
    $locale: String
  ) {
    signUp(
      email: $email
      password: $password
      workspaceInviteHash: $workspaceInviteHash
      workspacePersonalInviteToken: $workspacePersonalInviteToken
      captchaToken: $captchaToken
      workspaceId: $workspaceId
      locale: $locale
    ) {
      loginToken {
        token
        expiresAt
      }
      workspace {
        id
        workspaceUrls {
          subdomainUrl
          customUrl
      },
      }
    }
  }
`;

export const signUpOperationFactory = (input: SignUpInput) => {
  return {
    query: SignUpDocument,
    variables: {
      ...input,
    },
  };
};
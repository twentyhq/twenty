import gql from 'graphql-tag';

export type ConnectApplicationWithApiKeyFactoryInput = {
  applicationId: string;
  providerName: string;
  apiKey: string;
  reconnectingConnectedAccountId?: string;
};

export const connectApplicationWithApiKeyQueryFactory = ({
  input,
}: {
  input: ConnectApplicationWithApiKeyFactoryInput;
}) => ({
  query: gql`
    mutation ConnectApplicationWithApiKey(
      $input: ConnectApplicationWithApiKeyInput!
    ) {
      connectApplicationWithApiKey(input: $input)
    }
  `,
  variables: { input },
});

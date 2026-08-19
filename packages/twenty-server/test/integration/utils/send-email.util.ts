import gql from 'graphql-tag';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type SendEmailInput = {
  connectedAccountId: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  inReplyTo?: string;
  draftMessageId?: string;
};

type SendEmailResult = {
  success: boolean;
  error?: string;
  messageThreadId?: string;
};

const SEND_EMAIL_MUTATION = gql`
  mutation SendEmailForIntegrationTest($input: SendEmailInput!) {
    sendEmail(input: $input) {
      success
      error
      messageThreadId
    }
  }
`;

export const sendEmail = async (
  input: SendEmailInput,
): Promise<SendEmailResult> => {
  const response = await makeMetadataAPIRequest({
    query: SEND_EMAIL_MUTATION,
    variables: { input },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.sendEmail;
};

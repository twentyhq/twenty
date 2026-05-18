import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type SaveImapSmtpCaldavAccountInput = {
  handle: string;
  connectionParameters: {
    IMAP?: {
      host: string;
      port: number;
      username?: string;
      password?: string;
      secure?: boolean;
    };
    SMTP?: {
      host: string;
      port: number;
      username?: string;
      password?: string;
      secure?: boolean;
    };
    CALDAV?: {
      host: string;
      port: number;
      username?: string;
      password?: string;
      secure?: boolean;
    };
  };
  id?: string;
};

export const saveImapSmtpCaldavAccount = async ({
  input,
  expectToFail,
}: {
  input: SaveImapSmtpCaldavAccountInput;
  expectToFail: boolean;
}) => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation SaveImapSmtpCaldavAccount(
        $handle: String!
        $connectionParameters: EmailAccountConnectionParameters!
        $id: UUID
      ) {
        saveImapSmtpCaldavAccount(
          handle: $handle
          connectionParameters: $connectionParameters
          id: $id
        ) {
          success
          connectedAccountId
        }
      }
    `,
    variables: {
      handle: input.handle,
      connectionParameters: input.connectionParameters,
      ...(input.id && { id: input.id }),
    },
  });

  if (expectToFail) {
    expect(response.body.errors).toBeDefined();

    return { errors: response.body.errors, data: null };
  }

  expect(response.body.errors).toBeUndefined();

  return { errors: null, data: response.body.data.saveImapSmtpCaldavAccount };
};

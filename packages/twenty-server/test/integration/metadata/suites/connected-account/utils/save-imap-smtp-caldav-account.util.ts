import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';

type ProtocolConnectionInput = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  connectionSecurity?: EmailConnectionSecurity;
};

type SaveImapSmtpCaldavAccountInput = {
  handle: string;
  connectionParameters: {
    IMAP?: ProtocolConnectionInput;
    SMTP?: ProtocolConnectionInput;
    CALDAV?: ProtocolConnectionInput;
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

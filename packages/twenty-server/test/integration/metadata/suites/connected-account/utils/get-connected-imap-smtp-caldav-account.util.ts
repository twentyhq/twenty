import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const getConnectedImapSmtpCaldavAccount = async ({
  id,
}: {
  id: string;
}) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query GetConnectedImapSmtpCaldavAccount($id: UUID!) {
        getConnectedImapSmtpCaldavAccount(id: $id) {
          id
          handle
          provider
          userWorkspaceId
          connectionParameters {
            IMAP {
              host
              port
              username
              connectionSecurity
            }
            SMTP {
              host
              port
              username
              connectionSecurity
            }
            CALDAV {
              host
              port
              username
              connectionSecurity
            }
          }
        }
      }
    `,
    variables: { id },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.getConnectedImapSmtpCaldavAccount;
};

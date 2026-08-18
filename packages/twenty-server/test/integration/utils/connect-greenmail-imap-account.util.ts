import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  type GreenmailServer,
  startGreenmailContainer,
} from 'test/integration/utils/start-greenmail-container.util';

export type GreenmailImapAccount = {
  greenmail: GreenmailServer;
  connectedAccountId: string;
  messageChannelId: string;
};

// The IMAP driver routes through the SSRF guard, which rejects the container's
// private address before the connection is attempted.
export const connectGreenmailImapAccount = async ({
  handle,
  password,
}: {
  handle: string;
  password: string;
}): Promise<GreenmailImapAccount> => {
  await updateConfigVariable({
    input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
  });

  const greenmail = await startGreenmailContainer({
    username: handle,
    password,
  });
  const mailboxLogin = handle.split('@')[0];

  const { data } = await saveImapSmtpCaldavAccount({
    input: {
      handle,
      connectionParameters: {
        IMAP: {
          host: greenmail.host,
          port: greenmail.imapPort,
          username: mailboxLogin,
          password,
          connectionSecurity: EmailConnectionSecurity.NONE,
        },
      },
    },
    expectToFail: false,
  });

  const connectedAccountId = data.connectedAccountId;
  const messageChannelId = (
    await getCoreRepository<MessageChannelEntity>(
      MessageChannelEntity,
    ).findOneByOrFail({ connectedAccountId })
  ).id;

  return { greenmail, connectedAccountId, messageChannelId };
};

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import {
  type DovecotServer,
  startDovecotContainer,
} from 'test/integration/utils/start-dovecot-container.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

export type DovecotImapAccount = {
  dovecot: DovecotServer;
  connectedAccountId: string;
  messageChannelId: string;
};

// The SSRF guard would otherwise reject the container's private address.
export const connectDovecotImapAccount = async ({
  handle,
  password,
}: {
  handle: string;
  password: string;
}): Promise<DovecotImapAccount> => {
  await updateConfigVariable({
    input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: ['*'] },
  });

  const dovecot = await startDovecotContainer({ password });

  const { data } = await saveImapSmtpCaldavAccount({
    input: {
      handle,
      connectionParameters: {
        IMAP: {
          host: dovecot.host,
          port: dovecot.imapPort,
          username: handle,
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

  return { dovecot, connectedAccountId, messageChannelId };
};

import { isNonEmptyString } from '@sniptt/guards';
import { type ImapFlow } from 'imapflow';

import { normalizeImapMailboxPath } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/normalize-imap-mailbox-path.util';

export const getImapFolderPath = (
  externalId: string | null | undefined,
  client?: Pick<ImapFlow, 'enabled'>,
): string | null => {
  if (!isNonEmptyString(externalId)) {
    return null;
  }

  const lastColonIndex = externalId.lastIndexOf(':');

  if (lastColonIndex === -1) {
    return normalizeImapMailboxPath(externalId, client);
  }

  const suffix = externalId.slice(lastColonIndex + 1);

  if (!/^\d+$/.test(suffix)) {
    return normalizeImapMailboxPath(externalId, client);
  }

  return normalizeImapMailboxPath(externalId.slice(0, lastColonIndex), client);
};

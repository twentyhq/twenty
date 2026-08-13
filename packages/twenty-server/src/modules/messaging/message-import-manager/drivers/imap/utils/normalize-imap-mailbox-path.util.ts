import { type ImapFlow } from 'imapflow';

export const normalizeImapMailboxPath = (
  path: string,
  client?: Pick<ImapFlow, 'enabled'>,
): string =>
  client?.enabled.has('UTF8=ACCEPT') ? path.normalize('NFC') : path;

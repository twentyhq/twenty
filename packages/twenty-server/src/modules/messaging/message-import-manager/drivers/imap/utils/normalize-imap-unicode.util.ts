import { type ImapFlow } from 'imapflow';

export const normalizeImapUnicode = (
  value: string,
  client?: Pick<ImapFlow, 'enabled'>,
): string =>
  client?.enabled.has('UTF8=ACCEPT') ? value.normalize('NFC') : value;

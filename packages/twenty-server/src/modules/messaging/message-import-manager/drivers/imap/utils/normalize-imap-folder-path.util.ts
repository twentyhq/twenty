import { type ImapFlow } from 'imapflow';

export const normalizeImapFolderPath = (
  client: Pick<ImapFlow, 'enabled'>,
  folderPath: string,
): string =>
  client.enabled.has('UTF8=ACCEPT') ? folderPath.normalize('NFC') : folderPath;

import { isNonEmptyString } from '@sniptt/guards';
import { type ImapFlow } from 'imapflow';

const normalizeMailboxPath = (client: ImapFlow, folderPath: string): string =>
  client.enabled.has('UTF8=ACCEPT') ? folderPath.normalize('NFC') : folderPath;

const normalizePathArgument = (
  client: ImapFlow,
  path: string | string[],
): string | string[] =>
  typeof path === 'string' ? normalizeMailboxPath(client, path) : path;

export const withNormalizedMailboxPaths = (client: ImapFlow): ImapFlow => {
  const originalGetMailboxLock = client.getMailboxLock.bind(client);
  const originalStatus = client.status.bind(client);
  const originalAppend = client.append.bind(client);
  const originalMailboxCreate = client.mailboxCreate.bind(client);
  const originalList = client.list.bind(client);

  client.getMailboxLock = (path, options) =>
    originalGetMailboxLock(normalizePathArgument(client, path), options);

  client.status = (path, query) =>
    originalStatus(normalizeMailboxPath(client, path), query);

  client.append = (path, content, flags, idate) =>
    originalAppend(normalizeMailboxPath(client, path), content, flags, idate);

  client.mailboxCreate = (path) =>
    originalMailboxCreate(normalizePathArgument(client, path));

  client.list = async (options) => {
    const mailboxes = await originalList(options);

    for (const mailbox of mailboxes) {
      mailbox.path = normalizeMailboxPath(client, mailbox.path);

      if (isNonEmptyString(mailbox.parentPath)) {
        mailbox.parentPath = normalizeMailboxPath(client, mailbox.parentPath);
      }
    }

    return mailboxes;
  };

  return client;
};
